import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { processAndUploadFile } from "@/lib/uploadFile";
import { checkApiPermission } from "@/lib/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const trainingCollaborators = await db.trainingCollaborator.findMany({
      where: {
        trainingId: params.trainingId,
      },
      include: {
        collaborator: {
          include: {
            city: {
              include: {
                regional: true
              }
            }
          }
        },
        courseLevel: {
          include: {
            requiredDocuments: true
          }
        },
        documents: {
          include: {
            requiredDocument: true
          }
        }
      },
      orderBy: {
        registrationDate: "desc",
      },
    });

    return NextResponse.json(trainingCollaborators);
  } catch (error) {
    console.error("[TRAINING_COLLABORATORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // COORDINATOR y ADMIN pueden agregar colaboradores a capacitaciones
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_COLLABORATORS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const collaboratorId = formData.get('collaboratorId') as string;
    const courseLevelId = formData.get('courseLevelId') as string;

    if (!collaboratorId || !courseLevelId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verificar que el colaborador no esté ya registrado en esta capacitación
    const existingRegistration = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: collaboratorId
        }
      }
    });

    if (existingRegistration) {
      return new NextResponse("Collaborator already registered", { status: 400 });
    }

    // Verificar si el colaborador ya tiene certificado válido del mismo curso y nivel
    // 1. Verificar certificados regulares
    const existingCertificate = await db.certificate.findFirst({
      where: {
        collaboratorId: collaboratorId,
        courseLevelId: courseLevelId,
        active: true,
      },
    });

    // 2. Verificar certificados CETAR
    const existingCetarCertificate = await db.cetarCertificate.findFirst({
      where: {
        collaboratorId: collaboratorId,
        courseLevelId: courseLevelId,
        active: true,
      },
    });

    // Si tiene certificado regular, verificar si no ha vencido
    if (existingCertificate) {
      const courseLevel = await db.courseLevel.findUnique({
        where: { id: courseLevelId },
        include: { course: true },
      });

      // Si el nivel no tiene vencimiento (monthsToExpire = 0), no se puede volver a certificar
      if (courseLevel?.monthsToExpire === 0) {
        return new NextResponse(
          `El colaborador ya tiene certificado válido del curso "${courseLevel.course?.name}" - Nivel "${courseLevel.name}". Los certificados de este nivel no vencen.`,
          { status: 400 }
        );
      }

      // Si el certificado aún no ha vencido, no se puede volver a certificar
      if (existingCertificate.dueDate && existingCertificate.dueDate > new Date()) {
        return new NextResponse(
          `El colaborador ya tiene certificado válido del curso "${courseLevel?.course?.name}" - Nivel "${courseLevel?.name}" que vence el ${existingCertificate.dueDate.toLocaleDateString()}.`,
          { status: 400 }
        );
      }
    }

    // Si tiene certificado CETAR activo, no se puede inscribir de nuevo
    if (existingCetarCertificate) {
      const courseLevel = await db.courseLevel.findUnique({
        where: { id: courseLevelId },
        include: { course: true },
      });

      return new NextResponse(
        `El colaborador ya tiene certificado CETAR válido del curso "${courseLevel?.course?.name}" - Nivel "${courseLevel?.name}".`,
        { status: 400 }
      );
    }

    // Verificar capacidad máxima y obtener información de la capacitación
    const training = await db.training.findUnique({
      where: { id: params.trainingId },
      include: {
        trainingCollaborators: true
      }
    });

    if (!training) {
      return new NextResponse("Training not found", { status: 404 });
    }

    if (training.maxCapacity && training.trainingCollaborators.length >= training.maxCapacity) {
      return new NextResponse("Training is at maximum capacity", { status: 400 });
    }

    // Obtener documentos requeridos para el nivel
    const courseLevel = await db.courseLevel.findUnique({
      where: { id: courseLevelId },
      include: {
        requiredDocuments: true
      }
    });

    if (!courseLevel) {
      return new NextResponse("Course level not found", { status: 404 });
    }

    // Usar transacción para crear colaborador, certificado CETAR y documentos
    const result = await db.$transaction(async (tx) => {
      // 1. Crear el training collaborator
      const trainingCollaborator = await tx.trainingCollaborator.create({
        data: {
          trainingId: params.trainingId,
          collaboratorId,
          courseLevelId,
          // Si es CETAR, marcar como completado inmediatamente
          status: training.byCetar ? "COMPLETED" : "REGISTERED",
          completionDate: training.byCetar ? new Date() : null,
        }
      });

      // 2. Si es CETAR, crear certificado CETAR automáticamente
      let cetarCertificate = null;
      if (training.byCetar) {
        // Obtener información del colaborador para el certificado
        const collaborator = await tx.collaborator.findUnique({
          where: { id: collaboratorId }
        });

        if (collaborator) {
          // Calcular fecha de vencimiento si aplica
          let dueDate: Date | null = null;
          if (courseLevel.monthsToExpire && courseLevel.monthsToExpire > 0) {
            dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + courseLevel.monthsToExpire);
          }

          cetarCertificate = await tx.cetarCertificate.create({
            data: {
              trainingId: params.trainingId,
              collaboratorId,
              courseLevelId,
              certificateUrl: "", // URL vacía, se llenará después
              collaboratorFullname: collaborator.fullname,
              collaboratorNumDoc: collaborator.numDoc,
              collaboratorTypeDoc: collaborator.docType,
              dueDate,
            }
          });
        }
      }

      // 3. Procesar y subir documentos solo si NO es CETAR
      const documentEntries = [];
      
      if (!training.byCetar) {
        // Solo procesar documentos si la capacitación NO es CETAR
        for (const requiredDoc of courseLevel.requiredDocuments) {
          const file = formData.get(`documents[${requiredDoc.id}]`) as File;
          
          if (!file) {
            throw new Error(`Missing required document: ${requiredDoc.name}`);
          }

          // Crear FormData para processAndUploadFile
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('field', 'document');
          uploadFormData.append('ubiPath', `training-documents/${params.trainingId}/${collaboratorId}`);

          // Simular Request para processAndUploadFile
          const mockRequest = new Request('http://localhost', {
            method: 'POST',
            body: uploadFormData
          });

          const uploadResult = await processAndUploadFile(mockRequest);
          
          if (uploadResult.error) {
            throw new Error(`Error uploading ${requiredDoc.name}: ${uploadResult.error}`);
          }

          // 3. Crear entrada en la base de datos
          const documentEntry = await tx.trainingCollaboratorDocument.create({
            data: {
              trainingCollaboratorId: trainingCollaborator.id,
              requiredDocumentId: requiredDoc.id,
              fileName: file.name,
              documentLink: uploadResult.url!,
              fileSize: file.size,
              uploadedBy: session.user.email || 'unknown',
              status: 'APPROVED'
            }
          });

          documentEntries.push(documentEntry);
        }
      }

      return {
        trainingCollaborator,
        documents: documentEntries,
        cetarCertificate
      };
    });

    // Obtener el resultado completo con includes
    const fullTrainingCollaborator = await db.trainingCollaborator.findUnique({
      where: { id: result.trainingCollaborator.id },
      include: {
        collaborator: {
          include: {
            city: {
              include: {
                regional: true
              }
            }
          }
        },
        courseLevel: {
          include: {
            requiredDocuments: true
          }
        },
        documents: {
          include: {
            requiredDocument: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      trainingCollaborator: fullTrainingCollaborator,
      documentsUploaded: result.documents.length
    });
  } catch (error) {
    console.error("[TRAINING_COLLABORATORS_POST]", error);
    return new NextResponse(error as string, { status: 500 });
  }
} 