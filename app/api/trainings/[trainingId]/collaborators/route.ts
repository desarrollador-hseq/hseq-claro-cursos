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

    const { searchParams } = new URL(req.url);
    const collaboratorIds = searchParams.get("collaboratorIds");
    const courseLevelId = searchParams.get("courseLevelId");

    // If checking certificate status for specific collaborators
    if (collaboratorIds && courseLevelId) {
      const ids = collaboratorIds.split(',');
      const certificateStatus = await Promise.all(
        ids.map(async (collaboratorId) => {
          // Check regular certificates
          const existingCertificate = await db.certificate.findFirst({
            where: {
              collaboratorId,
              courseLevelId,
              active: true,
            },
          });

          // Check CETAR certificates
          const existingCetarCertificate = await db.cetarCertificate.findFirst({
            where: {
              collaboratorId,
              courseLevelId,
              active: true,
            },
          });

          let hasCertificate = false;
          let certificateId = null;
          let certificateMessage = "";
          let certificateType: 'regular' | 'cetar' | null = null;

          if (existingCertificate) {
            console.log("existingCertificate", existingCertificate);
            hasCertificate = true;
            certificateId = existingCertificate.id;
            certificateType = 'regular';
            const courseLevel = await db.courseLevel.findUnique({
              where: { id: courseLevelId },
              include: { course: true },
            });
            
            if (courseLevel?.monthsToExpire === 0) {
              certificateMessage = `Certificado: "${courseLevel.course?.name}" - Nivel "${courseLevel.name}". F.V: N/A`;
            } else if (existingCertificate.dueDate && existingCertificate.dueDate > new Date()) {
              certificateMessage = `Certificado: "${courseLevel?.course?.name}" - Nivel "${courseLevel?.name}" F.V: ${existingCertificate.dueDate?.toLocaleDateString()}.`;
            } else {
              certificateMessage = `Certificado: "${courseLevel?.course?.name}" - Nivel "${courseLevel?.name}" F.V: ${existingCertificate.dueDate?.toLocaleDateString()}.`;
            }
          } else if (existingCetarCertificate) {
            hasCertificate = true;
            certificateId = existingCetarCertificate.id;
            certificateType = 'cetar';
            const courseLevel = await db.courseLevel.findUnique({
              where: { id: courseLevelId },
              include: { course: true },
            });
            certificateMessage = `Certificado: Cetar - "${courseLevel?.course?.name}" - Nivel "${courseLevel?.name}".`;
          }

          return {
            collaboratorId,
            hasCertificate,
            certificateType,
            certificateMessage,
            certificateId
          };
        })
      );

      return NextResponse.json(certificateStatus);
    }

    // Original GET logic for training collaborators
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
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_COLLABORATORS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const collaboratorsIds: string[] = body.collaboratorsIds;
    const courseLevelId: string = body.courseLevelId;
    if (!Array.isArray(collaboratorsIds) || !courseLevelId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get training and check capacity
    const training = await db.training.findUnique({
      where: { id: params.trainingId },
      include: { trainingCollaborators: true }
    });
    if (!training) {
      return new NextResponse("Training not found", { status: 404 });
    }
    const currentCount = training.trainingCollaborators.length;
    const maxCapacity = training.maxCapacity || Infinity;
    let availableSlots = maxCapacity - currentCount;
    if (availableSlots <= 0) {
      return new NextResponse("Training is at maximum capacity", { status: 400 });
    }

    // Filter out already registered collaborators
    const alreadyRegistered = await db.trainingCollaborator.findMany({
      where: {
        trainingId: params.trainingId,
        collaboratorId: { in: collaboratorsIds }
      },
      select: { collaboratorId: true }
    });
    const alreadyRegisteredIds = new Set(alreadyRegistered.map(c => c.collaboratorId));
    const toRegister = collaboratorsIds.filter(id => !alreadyRegisteredIds.has(id)).slice(0, availableSlots);
    const skipped = collaboratorsIds.filter(id => alreadyRegisteredIds.has(id));

    // Register all in a transaction
    const results = await db.$transaction(async (tx) => {
      const created: any[] = [];
      for (const collaboratorId of toRegister) {
        // Check for valid certificate (skip if has valid one)
        const existingCertificate = await tx.certificate.findFirst({
          where: {
            collaboratorId,
            courseLevelId,
            active: true,
          },
        });
        const existingCetarCertificate = await tx.cetarCertificate.findFirst({
          where: {
            collaboratorId,
            courseLevelId,
            active: true,
          },
        });
        if (existingCertificate || existingCetarCertificate) {
          skipped.push(collaboratorId);
          continue;
        }
        // Register
        await tx.trainingCollaborator.create({
          data: {
            trainingId: params.trainingId,
            collaboratorId,
            courseLevelId,
            status: training.byCetar ? "COMPLETED" : "REGISTERED",
            completionDate: training.byCetar ? new Date() : null,
            certificateIssued: training.byCetar ? true : false,
          }
        });
        created.push(collaboratorId);
      }
      return { created, skipped };
    });

    return NextResponse.json({
      success: true,
      registered: results.created,
      skipped: results.skipped,
      totalRegistered: results.created.length,
      totalSkipped: results.skipped.length
    });
  } catch (error) {
    console.error("[TRAINING_COLLABORATORS_POST]", error);
    return new NextResponse(error as string, { status: 500 });
  }
} 