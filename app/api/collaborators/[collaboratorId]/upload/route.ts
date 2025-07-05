

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { processAndDeleteFile, processAndUploadFile } from "@/lib/uploadFile";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: Request, { params }: { params: { collaboratorId: string } }) {
    const session = await getServerSession(authOptions)
    try {
        if(!session) return new NextResponse("Unauthorized", {status: 401})
        const collaborator = await db.collaborator.findUnique({
            where: {
                id: params.collaboratorId
            }
        })
        if (!collaborator) return new NextResponse("Colaborador no encontrado", { status: 404 })

        const { file, url, error, field, ubiPath } = await processAndUploadFile(req);

        if (error) {
            return new NextResponse(error.toString(), { status: 400 });
        }
        if (!file) {
            return new NextResponse("Archivo no encontrado", { status: 400 });
        }
        const campo = collaborator[field as keyof typeof collaborator] as string

        if (campo) {
            const urlLastPath = new URL(campo).pathname.substring(1).split("/").pop()
            const { ok } = await processAndDeleteFile(ubiPath, `${urlLastPath}`)
        }

        const collaboratorUpdated = await db.collaborator.update({
            where: {
                id: collaborator.id
            },
            data: {
                [field]: url
            }
        })


        return NextResponse.json({
            collaborator: collaboratorUpdated
        })
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Errorr: " + error, { status: 500 })
    }
}
