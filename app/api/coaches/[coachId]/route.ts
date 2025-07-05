import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { processAndUploadFile, processAndDeleteFile } from "@/lib/uploadFile";

export async function GET(req: Request, { params }: { params: { coachId: string } }) {
  try {
      const session = await getServerSession(authOptions)
      
      if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }

      const coach = await db.coach.findUnique({
          where: { id: params.coachId },
      })

      if (!coach) {
        return new NextResponse("Coach not found", { status: 404 })
      }

      return NextResponse.json(coach)

  } catch (error) {
      console.log("[COACH_GET_ID]", error)
      return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { coachId: string } }) {
  try {
      const session = await getServerSession(authOptions)
      const { coachId } = params;

      if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }

      // Verificar que el coach existe
      const existingCoach = await db.coach.findUnique({
        where: { id: coachId }
      })

      if (!existingCoach) {
        return new NextResponse("Coach not found", { status: 404 })
      }

      const formData = await req.formData()
      const fullname = formData.get('fullname') as string
      const numDoc = formData.get('numDoc') as string
      const docType = formData.get('docType') as string
      const position = formData.get('position') as string
      const license = formData.get('license') as string
      const phone = formData.get('phone') as string
      const signatureFile = formData.get('signatureFile') as File
      const keepCurrentSignature = formData.get('keepCurrentSignature') as string

      // Validaciones básicas
      if (!fullname || !numDoc || !docType) {
        return new NextResponse("Missing required fields", { status: 400 })
      }

      // Verificar si el número de documento ya existe (excluyendo el coach actual)
      if (numDoc !== existingCoach.numDoc) {
        const docExists = await db.coach.findUnique({
          where: { numDoc: numDoc.replace(/\./g, '') }
        })

        if (docExists) {
          return new NextResponse("Coach with this document already exists", { status: 400 })
        }
      }

      let signatureUrl: string | null = existingCoach.signatureUrl

      // Manejar la imagen de firma
      if (signatureFile && signatureFile.size > 0) {
        // Eliminar la imagen anterior si existe
        if (existingCoach.signatureUrl) {
          await processAndDeleteFile('coaches/signatures', existingCoach.signatureUrl)
        }

        // Subir nueva imagen
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
      } else if (keepCurrentSignature !== 'true') {
        // Si no se sube nueva imagen y no se quiere mantener la actual, eliminarla
        if (existingCoach.signatureUrl) {
          await processAndDeleteFile('coaches/signatures', existingCoach.signatureUrl)
          signatureUrl = null
        }
      }

      const coach = await db.coach.update({
          where: {
              id: coachId,
          },
          data: {
              fullname,
              numDoc: numDoc.replace(/\./g, ''),
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
      console.log("[COACH_PATCH_ID]", error)
      return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { coachId: string } }) {
  try {
      const session = await getServerSession(authOptions)
      
      if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 })
      }

      const coach = await db.coach.findUnique({
        where: { id: params.coachId }
      })

      if (!coach) {
        return new NextResponse("Coach not found", { status: 404 })
      }

      // Soft delete - marcar como inactivo
      const deletedCoach = await db.coach.update({
          where: { id: params.coachId },
          data: { active: false }
      })

      // Eliminar imagen de firma si existe
      if (coach.signatureUrl) {
        await processAndDeleteFile('coaches/signatures', coach.signatureUrl)
      }

      return NextResponse.json({
        success: true,
        coach: deletedCoach
      })

  } catch (error) {
      console.log("[COACH_DELETE_ID]", error)
      return new NextResponse("Internal Error", { status: 500 })
  }
}