import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { checkApiPermission } from "@/lib/permissions";
import { processAndUploadFile, processAndDeleteFile } from "@/lib/uploadFile";

export async function GET(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string; requiredDocumentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Obtener el TrainingCollaborator
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId
        }
      }
    });

    if (!trainingCollaborator) {
      return new NextResponse("Training collaborator not found", { status: 404 });
    }

    // Buscar el documento específico
    const document = await db.trainingCollaboratorDocument.findUnique({
      where: {
        trainingCollaboratorId_requiredDocumentId: {
          trainingCollaboratorId: trainingCollaborator.id,
          requiredDocumentId: params.requiredDocumentId
        }
      },
      include: {
        requiredDocument: true,
      }
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[TRAINING_COLLABORATOR_DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string; requiredDocumentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // COORDINATOR y ADMIN pueden actualizar documentos
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_COLLABORATORS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Obtener el TrainingCollaborator
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId
        }
      }
    });

    if (!trainingCollaborator) {
      return new NextResponse("Training collaborator not found", { status: 404 });
    }

    // Buscar el documento existente
    const existingDocument = await db.trainingCollaboratorDocument.findUnique({
      where: {
        trainingCollaboratorId_requiredDocumentId: {
          trainingCollaboratorId: trainingCollaborator.id,
          requiredDocumentId: params.requiredDocumentId
        }
      }
    });

    // Determinar si es FormData (archivo) o JSON (metadatos)
    const contentType = req.headers.get("content-type");
    const isFormData = contentType?.includes("multipart/form-data");

    if (isFormData) {
      // Manejar subida de archivo
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const ubiPath = formData.get('ubiPath') as string || 'trainings/documents';

      if (!file) {
        return new NextResponse("No file provided", { status: 400 });
      }

      // PASO 1: Subir archivo FUERA de la transacción
      let documentLink: string;
      let fileName: string;
      let fileSize: number;
      let oldFileLink: string | null = null;

      try {
        // Procesar y subir archivo
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('field', 'document');
        uploadFormData.append('ubiPath', ubiPath);

        const mockRequest = new Request('http://localhost', {
          method: 'POST',
          body: uploadFormData
        });

        const uploadResult = await processAndUploadFile(mockRequest);
        
        if (uploadResult.error || !uploadResult.url) {
          throw new Error(`Error uploading file: ${uploadResult.error}`);
        }

        documentLink = uploadResult.url;
        fileName = file.name;
        fileSize = file.size;
        oldFileLink = existingDocument?.documentLink || null;

      } catch (uploadError) {
        console.error("Upload error:", uploadError);
        return new NextResponse("Error uploading file", { status: 500 });
      }

      // PASO 2: Actualizar base de datos en transacción rápida
      try {
        const result = await db.$transaction(async (tx) => {
          // Actualizar o crear documento
          if (existingDocument) {
            return await tx.trainingCollaboratorDocument.update({
              where: { id: existingDocument.id },
              data: {
                documentLink,
                fileName,
                fileSize,
                uploadedBy: session.user.id,
                status: "APPROVED", // Reset status when new file is uploaded
              },
              include: {
                requiredDocument: true,
              }
            });
          } else {
            return await tx.trainingCollaboratorDocument.create({
              data: {
                trainingCollaboratorId: trainingCollaborator.id,
                requiredDocumentId: params.requiredDocumentId,
                documentLink,
                fileName,
                fileSize,
                uploadedBy: session.user.id,
                status: "APPROVED",
              },
              include: {
                requiredDocument: true,
              }
            });
          }
        }, {
          timeout: 10000 // 10 segundos de timeout para la transacción
        });

        // PASO 3: Eliminar archivo anterior después de confirmar DB (sin bloquear)
        if (oldFileLink) {
          processAndDeleteFile(ubiPath, oldFileLink).catch(deleteError => {
            console.warn("Could not delete old file:", deleteError);
            // No fallar por esto, solo logear
          });
        }

        return NextResponse.json(result);

      } catch (dbError) {
        // Si falla la BD, eliminar el archivo recién subido
        processAndDeleteFile(ubiPath, documentLink).catch(cleanupError => {
          console.warn("Could not cleanup uploaded file after DB error:", cleanupError);
        });
        
        console.error("Database error:", dbError);
        return new NextResponse("Database error", { status: 500 });
      }
    } else {
      // Manejar actualización de metadatos (revisión, notas, etc.)
      const body = await req.json();
      const { status, reviewNotes } = body;

      if (!existingDocument) {
        return new NextResponse("Document not found", { status: 404 });
      }

      const updatedDocument = await db.trainingCollaboratorDocument.update({
        where: { id: existingDocument.id },
        data: {
          ...(status && { status, reviewedBy: session.user.id, reviewedAt: new Date() }),
          ...(reviewNotes !== undefined && { reviewNotes }),
        },
        include: {
          requiredDocument: true,
        }
      });

      return NextResponse.json(updatedDocument);
    }
  } catch (error) {
    console.error("[TRAINING_COLLABORATOR_DOCUMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string; requiredDocumentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Solo ADMIN puede eliminar documentos
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_SYSTEM_CONFIG")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Obtener el TrainingCollaborator
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId
        }
      }
    });

    if (!trainingCollaborator) {
      return new NextResponse("Training collaborator not found", { status: 404 });
    }

    // Buscar y eliminar el documento
    const document = await db.trainingCollaboratorDocument.findUnique({
      where: {
        trainingCollaboratorId_requiredDocumentId: {
          trainingCollaboratorId: trainingCollaborator.id,
          requiredDocumentId: params.requiredDocumentId
        }
      }
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    await db.trainingCollaboratorDocument.delete({
      where: {
        id: document.id
      }
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("[TRAINING_COLLABORATOR_DOCUMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 