import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { checkApiPermission } from "@/lib/permissions";

// GET - Obtener certificado CETAR
export async function GET(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cetarCertificate = await db.cetarCertificate.findFirst({
      where: {
        trainingId: params.trainingId,
        collaboratorId: params.collaboratorId,
        active: true,
      },
      include: {
        collaborator: true,
        courseLevel: {
          include: {
            course: true,
          },
        },
        training: true,
      },
    });

    if (!cetarCertificate) {
      return new NextResponse("CETAR certificate not found", { status: 404 });
    }

    return NextResponse.json(cetarCertificate);
  } catch (error) {
    console.error("[GET_CETAR_CERTIFICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST - Crear certificado CETAR
export async function POST(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_COLLABORATORS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { certificateUrl, dueDate } = body;

    if (!certificateUrl) {
      return new NextResponse("Certificate URL is required", { status: 400 });
    }

    // Validar que es una capacitación CETAR
    const training = await db.training.findUnique({
      where: { id: params.trainingId },
      include: {
        course: true,
      },
    });

    if (!training || !training.byCetar) {
      return new NextResponse("Training not found or not CETAR", { status: 400 });
    }

    // Validar que el colaborador existe en la capacitación
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId,
        },
      },
      include: {
        collaborator: true,
        courseLevel: true,
      },
    });

    if (!trainingCollaborator) {
      return new NextResponse("Training collaborator not found", { status: 404 });
    }

    // Verificar si ya existe certificado CETAR
    const existingCertificate = await db.cetarCertificate.findFirst({
      where: {
        trainingId: params.trainingId,
        collaboratorId: params.collaboratorId,
        active: true,
      },
    });

    // Si ya existe certificado pero sin URL, actualizarlo en lugar de crear uno nuevo
    if (existingCertificate) {
      if (existingCertificate.certificateUrl && existingCertificate.certificateUrl.trim() !== "") {
        return new NextResponse("CETAR certificate with URL already exists", { status: 409 });
      }
      
      // Actualizar el certificado existente con la URL
      const updatedCertificate = await db.cetarCertificate.update({
        where: { id: existingCertificate.id },
        data: { certificateUrl },
        include: {
          collaborator: true,
          courseLevel: {
            include: {
              course: true,
            },
          },
          training: true,
        },
      });

      // Actualizar el estado del TrainingCollaborator
      await db.trainingCollaborator.update({
        where: {
          trainingId_collaboratorId: {
            trainingId: params.trainingId,
            collaboratorId: params.collaboratorId,
          },
        },
        data: {
          certificateIssued: true,
          status: "COMPLETED",
          completionDate: new Date(),
        },
      });

      return NextResponse.json(updatedCertificate);
    }

    // Validar URL
    try {
      new URL(certificateUrl);
    } catch (error) {
      return new NextResponse("Invalid URL format", { status: 400 });
    }

    // Calcular fecha de vencimiento si aplica
    let calculatedDueDate: Date | null = null;
    if (trainingCollaborator.courseLevel.monthsToExpire && trainingCollaborator.courseLevel.monthsToExpire > 0) {
      calculatedDueDate = new Date();
      calculatedDueDate.setMonth(calculatedDueDate.getMonth() + trainingCollaborator.courseLevel.monthsToExpire);
    } else if (dueDate) {
      calculatedDueDate = new Date(dueDate);
    }

    // Crear certificado CETAR
    const cetarCertificate = await db.cetarCertificate.create({
      data: {
        trainingId: params.trainingId,
        collaboratorId: params.collaboratorId,
        courseLevelId: trainingCollaborator.courseLevelId,
        certificateUrl,
        collaboratorFullname: trainingCollaborator.collaborator.fullname,
        collaboratorNumDoc: trainingCollaborator.collaborator.numDoc,
        collaboratorTypeDoc: trainingCollaborator.collaborator.docType,
        dueDate: calculatedDueDate,
      },
      include: {
        collaborator: true,
        courseLevel: {
          include: {
            course: true,
          },
        },
        training: true,
      },
    });

    // Actualizar el estado del TrainingCollaborator
    await db.trainingCollaborator.update({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId,
        },
      },
      data: {
        certificateIssued: true,
        status: "COMPLETED",
        completionDate: new Date(),
      },
    });

    return NextResponse.json(cetarCertificate);
  } catch (error) {
    console.error("[CREATE_CETAR_CERTIFICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH - Actualizar certificado CETAR
export async function PATCH(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_COLLABORATORS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { certificateUrl, dueDate } = body;

    // Buscar certificado CETAR existente
    const existingCertificate = await db.cetarCertificate.findFirst({
      where: {
        trainingId: params.trainingId,
        collaboratorId: params.collaboratorId,
        active: true,
      },
    });

    if (!existingCertificate) {
      return new NextResponse("CETAR certificate not found", { status: 404 });
    }

    const updateData: any = {};

    if (certificateUrl !== undefined) {
      if (certificateUrl === "") {
        // Permitir limpiar la URL
        updateData.certificateUrl = "";
      } else {
        try {
          new URL(certificateUrl);
          updateData.certificateUrl = certificateUrl;
        } catch (error) {
          return new NextResponse("Invalid URL format", { status: 400 });
        }
      }
    }

    if (dueDate !== undefined) {
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    }

    // Actualizar certificado CETAR
    const updatedCertificate = await db.cetarCertificate.update({
      where: { id: existingCertificate.id },
      data: updateData,
      include: {
        collaborator: true,
        courseLevel: {
          include: {
            course: true,
          },
        },
        training: true,
      },
    });

    // Actualizar estado del TrainingCollaborator basado en si tiene URL válida
    const hasValidUrl = updateData.certificateUrl && updateData.certificateUrl.trim() !== "";
    if (updateData.certificateUrl !== undefined) {
      await db.trainingCollaborator.update({
        where: {
          trainingId_collaboratorId: {
            trainingId: params.trainingId,
            collaboratorId: params.collaboratorId,
          },
        },
        data: {
          certificateIssued: hasValidUrl,
          status: hasValidUrl ? "COMPLETED" : "REGISTERED",
          completionDate: hasValidUrl ? new Date() : null,
        },
      });
    }

    return NextResponse.json(updatedCertificate);
  } catch (error) {
    console.error("[UPDATE_CETAR_CERTIFICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE - Eliminar certificado CETAR
export async function DELETE(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_COLLABORATORS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Buscar certificado CETAR
    const cetarCertificate = await db.cetarCertificate.findFirst({
      where: {
        trainingId: params.trainingId,
        collaboratorId: params.collaboratorId,
        active: true,
      },
    });

    if (!cetarCertificate) {
      return new NextResponse("CETAR certificate not found", { status: 404 });
    }

    await db.$transaction(async (tx) => {
      // Marcar certificado como inactivo
      await tx.cetarCertificate.update({
        where: { id: cetarCertificate.id },
        data: { active: false },
      });

      // Actualizar estado del TrainingCollaborator
      await tx.trainingCollaborator.update({
        where: {
          trainingId_collaboratorId: {
            trainingId: params.trainingId,
            collaboratorId: params.collaboratorId,
          },
        },
        data: {
          certificateIssued: false,
          status: "REGISTERED",
          completionDate: null,
        },
      });
    });

    return new NextResponse("CETAR certificate deleted", { status: 200 });
  } catch (error) {
    console.error("[DELETE_CETAR_CERTIFICATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 