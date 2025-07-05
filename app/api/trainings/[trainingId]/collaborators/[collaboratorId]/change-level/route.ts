import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseLevelId } = body;

    if (!courseLevelId) {
      return new NextResponse("Missing courseLevelId", { status: 400 });
    }

    // Verificar que el TrainingCollaborator existe
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

    // Verificar que el nuevo nivel existe
    const newLevel = await db.courseLevel.findUnique({
      where: { id: courseLevelId }
    });

    if (!newLevel) {
      return new NextResponse("Course level not found", { status: 404 });
    }

    // Verificar que el nuevo nivel pertenece al mismo curso
    const training = await db.training.findUnique({
      where: { id: params.trainingId },
      include: {
        course: {
          include: {
            courseLevels: true
          }
        }
      }
    });

    if (!training) {
      return new NextResponse("Training not found", { status: 404 });
    }

    const validLevelIds = training.course.courseLevels.map(level => level.id);
    if (!validLevelIds.includes(courseLevelId)) {
      return new NextResponse("Course level does not belong to this training's course", { status: 400 });
    }

    // Actualizar el nivel del colaborador
    const updatedTrainingCollaborator = await db.trainingCollaborator.update({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId
        }
      },
      data: {
        courseLevelId: courseLevelId,
        // Resetear algunos campos que podrían depender del nivel
        attendance: null,
        finalScore: null,
        completionDate: null,
        certificateIssued: false,
      }
    });

    return NextResponse.json({
      success: true,
      trainingCollaborator: updatedTrainingCollaborator
    });

  } catch (error) {
    console.error("[TRAINING_COLLABORATOR_CHANGE_LEVEL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 