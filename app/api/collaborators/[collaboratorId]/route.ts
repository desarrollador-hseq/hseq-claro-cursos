import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export async function PATCH(req: Request, { params }: { params: { collaboratorId: string } }) {
    try {
        // const session = await getServerSession(authOptions)
        const { collaboratorId } = params;
        const values = await req.json();
        // if (!session) return new NextResponse("Unauthorized", { status: 401 })

        // Verificar si el colaborador existe
        const currentCollaborator = await db.collaborator.findUnique({
            where: { id: collaboratorId, active: true }
        });

        if (!currentCollaborator) {
            return new NextResponse("Colaborador no encontrado", { status: 404 });
        }

        // Verificar duplicado de número de documento solo si cambió

        if (!!values.numDoc) {

            if (currentCollaborator.numDoc !== values.numDoc) {
                const duplicateDoc = await db.collaborator.findFirst({
                    where: { numDoc: values.numDoc, active: true }
                });

                if (duplicateDoc) {
                    return new NextResponse("Número de documento ya registrado", { status: 400 });
                }
            }
        }

        // Filtrar solo los campos que quieres permitir actualizar
        // Esto es opcional pero recomendado por seguridad
        const allowedFields = {
            fullname: values.fullname,
            numDoc: values.numDoc,
            cityId: values.cityId,
            startDate: values.startDate,
            endDate: values.endDate,
            percentage: values.percentage,
            certificateUrl: values.certificateUrl,
            isVirtual: values.isVirtual,
            byArl: values.byArl,
            checkCertificate: values.checkCertificate,
            // Agrega aquí solo los campos que quieres permitir actualizar
        };

        const collaborator = await db.collaborator.update({
            where: {
                id: collaboratorId,
            },
            data: allowedFields
        });

        return NextResponse.json(collaborator);
    } catch (error) {
        console.log("[COLLABORATOR_PATCH_ID]", error);
        return new NextResponse("Internal Error", { status: 500 }); // Corregí "Errorr" a "Error"
    }
}

export async function DELETE(req: Request, { params }: { params: { collaboratorId: string } }) {

    try {
        const session = await getServerSession(authOptions)
        const { collaboratorId } = params;

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        if (!collaboratorId) return new NextResponse("Not Found", { status: 404 })

        const collaboratorDeleted = await db.collaborator.update({
            where: {
                id: collaboratorId,
            },
            data: {
                active: false,
            },
        })

        return NextResponse.json(collaboratorDeleted)
    } catch (error) {
        console.log("[DELETED_ID_COLABORATOR]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}