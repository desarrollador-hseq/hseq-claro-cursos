import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { checkApiPermission } from "@/lib/permissions";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_TRAININGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status, statusChangeReason } = body;

    const validStatuses = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED", "POSTPONED"];
    
    if (!status || !validStatuses.includes(status)) {
      return new NextResponse("Invalid status", { status: 400 });
    }

    // Verificar que la capacitación existe
    const training = await db.training.findUnique({
      where: { id: params.trainingId },
      include: {
        trainingCollaborators: {
          select: {
            certificateIssued: true,
          }
        }
      }
    });

    if (!training) {
      return new NextResponse("Training not found", { status: 404 });
    }

    // Validaciones de lógica de negocio
    if (status === "CANCELLED") {
      // No se puede cancelar si ya hay certificados emitidos
      const hasCertificates = training.trainingCollaborators.some(tc => tc.certificateIssued);
      if (hasCertificates) {
        return new NextResponse("Cannot cancel training with issued certificates", { status: 400 });
      }
    }

    if (status === "COMPLETED") {
      // Verificar que la fecha de inicio ya pasó
      if (training.startDate > new Date()) {
        return new NextResponse("Cannot complete training before start date", { status: 400 });
      }
    }

    // Actualizar el estado
    const updatedTraining = await db.training.update({
      where: { id: params.trainingId },
      data: { 
        status: status as any,
        statusChangeReason: statusChangeReason || null,
      }
    });

    return NextResponse.json({
      success: true,
      training: updatedTraining,
      message: `Training status updated to ${status}`
    });

  } catch (error) {
    console.error("[TRAINING_STATUS_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 