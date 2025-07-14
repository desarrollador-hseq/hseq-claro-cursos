import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Solo coordinadores y admins pueden generar certificados
    if (!["ADMIN", "COORDINATOR"].includes(session.user.role || "")) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    const { collaboratorIds } = await request.json();

    if (!collaboratorIds || !Array.isArray(collaboratorIds)) {
      return NextResponse.json(
        { message: "Se requiere un array de IDs de colaboradores" },
        { status: 400 }
      );
    }

    // Obtener los parámetros de formación (threshold)
    const formationParameters = await db.formationParameters.findFirst({
      orderBy: {
        createdAt: "desc",
      },
    });

    const threshold = formationParameters?.threshold || 70;

    // Obtener la capacitación con toda la información necesaria
    const training = await db.training.findUnique({
      where: { id: params.trainingId },
      include: {
        course: {
          include: {
            courseLevels: {
              include: {
                requiredDocuments: true,
              },
            },
          },
        },
        coach: true,
        trainingCollaborators: {
          where: {
            collaboratorId: { in: collaboratorIds },
          },
          include: {
            collaborator: {
              include: {
                city: {
                  include: {
                    regional: true,
                  },
                },
              },
            },
            courseLevel: {
              include: {
                requiredDocuments: true,
              },
            },
            documents: {
              where: {
                status: "APPROVED",
              },
            },
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { message: "Capacitación no encontrada" },
        { status: 404 }
      );
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const trainingCollaborator of training.trainingCollaborators) {
      try {
        const collaborator = trainingCollaborator.collaborator;
        const courseLevel = trainingCollaborator.courseLevel;

        // Verificar si ya está certificado
        if (training.byCetar) {
          // Para CETAR, verificar si ya está marcado como certificado emitido
          if (trainingCollaborator.certificateIssued) {
            skipped++;
            continue;
          }
        } else {
          // Para no-CETAR, verificar tabla Certificate
          const existingCertificate = await db.certificate.findFirst({
            where: {
              collaboratorId: collaborator.id,
              courseLevelId: courseLevel.id,
              active: true,
            },
          });

          // Si existe certificado y el nivel no tiene vencimiento (monthsToExpire = 0), no se puede volver a certificar
          if (existingCertificate && courseLevel.monthsToExpire === 0) {
            skipped++;
            continue;
          }

          // Si existe certificado y aún no ha vencido, no se puede volver a certificar
          if (existingCertificate && existingCertificate.dueDate && existingCertificate.dueDate > new Date()) {
            skipped++;
            continue;
          }
        }

        // Verificar documentos requeridos (solo para no-CETAR)
        if (!training.byCetar) {
          const requiredDocsCount = courseLevel.requiredDocuments?.length || 0;
          
          // Filtrar solo los documentos que corresponden a los documentos requeridos del nivel actual
          const currentLevelRequiredDocIds = courseLevel.requiredDocuments?.map(doc => doc.id) || [];
          const validApprovedDocs = trainingCollaborator.documents.filter(doc => 
            currentLevelRequiredDocIds.includes(doc.requiredDocumentId)
          );
          const approvedDocsCount = validApprovedDocs.length;

          if (requiredDocsCount > 0 && approvedDocsCount < requiredDocsCount) {
            console.log(`Colaborador ${collaborator.name} ${collaborator.lastname}: Documentos insuficientes. Requeridos: ${requiredDocsCount}, Aprobados válidos: ${approvedDocsCount}`);
            errors++;
            continue;
          }
        }

        // Verificar requisitos para certificar
        if (training.byCetar) {
          // Para CETAR, verificar que tenga certificado CETAR con URL válida
          const cetarCertificate = await db.cetarCertificate.findFirst({
            where: {
              trainingId: params.trainingId,
              collaboratorId: collaborator.id,
              active: true,
            },
          });
          
          if (!cetarCertificate || !cetarCertificate.certificateUrl || cetarCertificate.certificateUrl.trim() === "") {
            console.log(`Colaborador ${collaborator.name} ${collaborator.lastname}: Falta URL de certificado CETAR para proceder con la certificación`);
            errors++;
            continue;
          }
        } else {
          // Para no-CETAR, verificar nota aprobatoria
          console.log({threshold})
          const finalScore = trainingCollaborator.finalScore;
          if (finalScore === null || finalScore === undefined || finalScore < threshold) {
            errors++;
            continue;
          }
        }

        console.log({threshold})


        // Para no-CETAR, crear certificado en la tabla Certificate
        if (!training.byCetar) {
          // Calcular fechas
          const now = new Date();
          const certificateDate = now;
          const startDate = training.startDate;
          const endDate = training.endDate;
          const expeditionDate = now;
          
          // Calcular fecha de vencimiento
          let dueDate: Date | null = null;
          if (courseLevel.monthsToExpire && courseLevel.monthsToExpire > 0) {
            dueDate = new Date(now);
            dueDate.setMonth(dueDate.getMonth() + courseLevel.monthsToExpire);
          }

          // Crear certificado
          const certificate = await db.certificate.create({
            data: {
              collaboratorId: collaborator.id,
              courseLevelId: courseLevel.id,
              coachId: training.coachId,
              
              // Información del colaborador (como strings)
              collaboratorFullname: collaborator.lastname + " " + collaborator.name,
              collaboratorNumDoc: collaborator.numDoc,
              collaboratorTypeDoc: collaborator.docType,
              collaboratorCityName: collaborator.city?.realName,
              collaboratorArlName: "", // Valor por defecto
              companyName: "CLARO COLOMBIA S.A.S",
              legalRepresentative: "",
              companyNit: "800225440-9",
              
              // Información del curso (como strings)
              courseName: training.course.name,
              levelName: courseLevel.name,
              resolution: training.course.resolution,
              levelHours: courseLevel.hours,
              monthsToExpire: courseLevel.monthsToExpire,
              
              // Información del coach (como strings)
              coachName: training.coach?.fullname || training.instructor,
              coachDoc: `${training.coach?.docType} ${training.coach?.numDoc}`,
              coachPosition: training.coach?.position,
              coachLicence: training.coach?.license,
              coachImgSignatureUrl: training.coach?.signatureUrl,
              
              // Fechas
              certificateDate,
              startDate,
              endDate,
              expeditionDate,
              dueDate,
              
              // Estado
              
              active: true,
            },
          });
        }

        // Actualizar el estado de certificado emitido en TrainingCollaborator
        const now = new Date();
        await db.trainingCollaborator.update({
          where: { id: trainingCollaborator.id },
          data: { 
            certificateIssued: true,
            status: "COMPLETED",
            completionDate: now
          },
        });

        created++;
      } catch (error) {
        console.error(`Error creando certificado para colaborador ${trainingCollaborator.collaboratorId}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      message: `Proceso completado. ${created} certificados creados, ${skipped} omitidos, ${errors} errores.`,
      created,
      skipped,
      errors,
    });

  } catch (error) {
    console.error("Error en certificación masiva:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 