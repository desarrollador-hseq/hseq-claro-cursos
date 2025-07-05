import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { processAndUploadFile } from "@/lib/uploadFile"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const coaches = await db.coach.findMany({
      where: {
        active: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(coaches)
  } catch (error) {
    console.log("[COACHES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    try {
        if (!session || session.user.role !== "ADMIN") {
          return new NextResponse("Unauthorized", { status: 401 })
        }

        const formData = await req.formData()
        const fullname = formData.get('fullname') as string
        const numDoc = formData.get('numDoc') as string
        const docType = formData.get('docType') as string
        const position = formData.get('position') as string
        const license = formData.get('license') as string
        const phone = formData.get('phone') as string
        const signatureFile = formData.get('signatureFile') as File

        // Validaciones básicas
        if (!fullname || !numDoc || !docType) {
          return new NextResponse("Missing required fields", { status: 400 })
        }

        // Verificar si ya existe un coach con el mismo documento
        const existingCoach = await db.coach.findUnique({
          where: { numDoc }
        })

        if (existingCoach) {
          return new NextResponse("Coach with this document already exists", { status: 400 })
        }

        let signatureUrl: string | null = null

        // Procesar imagen de firma si se proporciona
        if (signatureFile && signatureFile.size > 0) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', signatureFile)
          uploadFormData.append('field', 'signature')
          uploadFormData.append('ubiPath', `coaches/signatures`)

          const mockRequest = new Request('http://localhost', {
            method: 'POST',
            body: uploadFormData
          })

          const uploadResult = await processAndUploadFile(mockRequest)
          
          if (uploadResult.error) {
            return new NextResponse(`Error uploading signature: ${uploadResult.error}`, { status: 400 })
          }

          signatureUrl = uploadResult.url!
        }

        // Crear el coach
        const coach = await db.coach.create({
            data: {
                fullname,
                numDoc: numDoc.replace(/\./g, ''), // Remover puntos del número de documento
                docType: docType as any,
                position: position || null,
                license: license || null,
                phone: phone || null,
                signatureUrl: signatureUrl
            }
        })

        return NextResponse.json({
          success: true,
          coach
        })

    } catch (error) {
        console.log("[COACH-CREATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
