import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";

const scoreSchema = z.object({
  finalScore: z
    .number()
    .min(0, "La nota debe ser mayor o igual a 0")
    .max(100, "La nota debe ser menor o igual a 100"),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Verificar que el usuario tiene permisos para modificar capacitaciones
    if (!["ADMIN", "COORDINATOR"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "No tienes permisos para realizar esta acción" }, { status: 403 });
    }

    const { trainingId, collaboratorId } = params;
    
    const body = await request.json();
    const { finalScore } = scoreSchema.parse(body);

    // Verificar que la capacitación existe
    const training = await db.training.findUnique({
      where: { id: trainingId },
    });

    if (!training) {
      return NextResponse.json({ error: "Capacitación no encontrada" }, { status: 404 });
    }

    // Verificar que el colaborador está en la capacitación
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId,
          collaboratorId,
        },
      },
    });

    if (!trainingCollaborator) {
      return NextResponse.json({ error: "Colaborador no encontrado en la capacitación" }, { status: 404 });
    }

    // Actualizar la nota final
    const updatedCollaborator = await db.trainingCollaborator.update({
      where: {
        trainingId_collaboratorId: {
          trainingId,
          collaboratorId,
        },
      },
      data: {
        finalScore,
      },
    });

    return NextResponse.json({ 
      message: "Nota actualizada exitosamente",
      collaborator: updatedCollaborator 
    });

  } catch (error) {
    console.error("Error updating score:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 