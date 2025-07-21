import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

// Enum EppInspectionStatus (while Prisma is regenerated)
enum EppInspectionStatus {
  PENDING = "PENDING",
  VALIDATED = "VALIDATED", 
  CANCELED = "CANCELED"
}

interface UpdateStatusRequest {
  status: 'PENDING' | 'VALIDATED' | 'CANCELED';
  validationNotes?: string;
}

export async function PATCH(
  req: Request,
  { params }: { params: { inspectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { inspectionId } = params;
    const body: UpdateStatusRequest = await req.json();
    
    // Validar que el estado sea válido
    const validStatuses = ['PENDING', 'VALIDATED', 'CANCELED'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be PENDING, VALIDATED or CANCELED" },
        { status: 400 }
      );
    }

    // Verificar que la inspección existe
    const existingInspection = await db.eppCertificationInspection.findUnique({
      where: { id: inspectionId },
      select: { 
        id: true, 
        status: true,
        collaboratorName: true,
        eppName: true,
        eppSerialNumber: true
      }
    });

    if (!existingInspection) {
      return NextResponse.json(
        { error: "Inspección no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar estado de la inspección
    const updatedInspection = await db.eppCertificationInspection.update({
      where: { id: inspectionId },
      data: {
        status: body.status,
        validatedBy: session.user?.email || session.user?.name || "Usuario desconocido",
        validatedAt: new Date(),
        validationNotes: body.validationNotes || null
      },
      select: {
        id: true,
        status: true,
        validatedBy: true,
        validatedAt: true,
        validationNotes: true,
        collaboratorName: true,
        eppName: true,
        eppSerialNumber: true,
        inspectionDate: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Inspection ${body.status.toLowerCase()} successfully`,
      inspection: updatedInspection
    });

  } catch (error) {
    console.error("[EPP_INSPECTION_STATUS_UPDATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { inspectionId: string } }
) {
  try {
    const { inspectionId } = params;

    const inspection = await db.eppCertificationInspection.findUnique({
      where: { id: inspectionId },
      select: {
        id: true,
        status: true,
        validatedBy: true,
        validatedAt: true,
        validationNotes: true,
        collaboratorName: true,
        collaboratorNumDoc: true,
        eppType: true,
        eppName: true,
        eppSerialNumber: true,
        eppBrand: true,
        inspectorName: true,
        isSuitable: true,
        inspectionDate: true,
        certificationDate: true,
        observations: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!inspection) {
      return NextResponse.json(
        { error: "Inspección no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ inspection });

  } catch (error) {
    console.error("[EPP_INSPECTION_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 