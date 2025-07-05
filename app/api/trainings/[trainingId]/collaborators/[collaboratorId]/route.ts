import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Solo coordinadores y admins pueden eliminar colaboradores
    if (!["ADMIN", "COORDINATOR"].includes(session.user.role || "")) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    const { trainingId, collaboratorId } = params;

    // Verificar que la capacitación existe
    const training = await db.training.findUnique({
      where: { id: trainingId },
      include: {
        trainingCollaborators: {
          where: { collaboratorId },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { message: "Capacitación no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el colaborador esté inscrito en la capacitación
    const trainingCollaborator = training.trainingCollaborators[0];
    if (!trainingCollaborator) {
      return NextResponse.json(
        { message: "El colaborador no está inscrito en esta capacitación" },
        { status: 404 }
      );
    }

    // Verificar si el colaborador ya tiene certificado emitido
    if (trainingCollaborator.certificateIssued) {
      return NextResponse.json(
        { message: "No se puede eliminar un colaborador que ya tiene certificado emitido" },
        { status: 400 }
      );
    }

    // Iniciar transacción para eliminar colaborador y sus documentos
    const result = await db.$transaction(async (prisma) => {
      // Eliminar documentos relacionados
      await prisma.trainingCollaboratorDocument.deleteMany({
        where: {
          trainingCollaboratorId: trainingCollaborator.id,
        },
      });

      // Eliminar la relación TrainingCollaborator
      await prisma.trainingCollaborator.delete({
        where: {
          id: trainingCollaborator.id,
        },
      });

      return { success: true };
    });

    return NextResponse.json({
      message: "Colaborador eliminado exitosamente de la capacitación",
      result,
    });

  } catch (error) {
    console.error("Error eliminando colaborador:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 