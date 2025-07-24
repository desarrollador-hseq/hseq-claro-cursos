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
  categories?: Array<Record<string, string>>;
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

    // Verificar que la inspección existe y obtener detalles de inspección
    const existingInspection = await db.eppCertificationInspection.findUnique({
      where: { id: inspectionId },
      include: {
        inspectionDetails: {
          select: {
            category: true,
            answer: true,
            questionText: true
          }
        }
      }
    });

    if (!existingInspection) {
      return NextResponse.json(
        { error: "Inspección no encontrada" },
        { status: 404 }
      );
    }

    // Usar las categorías enviadas desde el frontend o generar automáticamente como fallback
    let inspectionCategories: Array<Record<string, string>> = [];
    
    if (body.categories && body.categories.length > 0) {
      // Usar las categorías enviadas desde el frontend
      inspectionCategories = body.categories;
    } else {
      // Fallback: generar automáticamente desde inspectionDetails
      const categoriesMap: Record<string, string> = {};
      existingInspection.inspectionDetails.forEach(detail => {
        if (detail.category) {
          categoriesMap[detail.category] = detail.answer;
        }
      });

      inspectionCategories = Object.keys(categoriesMap).length > 0 
        ? Object.entries(categoriesMap).map(([category, answer]) => ({ [category]: answer }))
        : [];
    }

    // Obtener el inspectionSummary actual y agregar las categorías
    const currentSummary = existingInspection.inspectionSummary as any || {};
    const updatedSummary = {
      ...currentSummary,
      categories: inspectionCategories
    };

    // Actualizar estado de la inspección
    let certificateNumberToAssign: string | undefined = undefined;
    if (body.status === 'VALIDATED' && !existingInspection.certificateNumber) {
      // Buscar el último número de certificado asignado
      const lastCert = await db.eppCertificationInspection.findFirst({
        where: { certificateNumber: { not: null } },
        orderBy: { certificateNumber: 'desc' },
        select: { certificateNumber: true },
      });
      let nextNumber = 1;
      if (lastCert && lastCert.certificateNumber) {
        // Quitar ceros a la izquierda y convertir a número
        const parsed = parseInt(lastCert.certificateNumber, 10);
        if (!isNaN(parsed)) nextNumber = parsed + 1;
      }
      certificateNumberToAssign = nextNumber.toString().padStart(5, '0');
    }

    const updatedInspection = await db.eppCertificationInspection.update({
      where: { id: inspectionId },
      data: {
        status: body.status,
        validatedBy: session.user?.email || session.user?.name || "Usuario desconocido",
        validatedAt: new Date(),
        validationNotes: body.validationNotes || null,
        inspectionSummary: updatedSummary,
        ...(certificateNumberToAssign ? { certificateNumber: certificateNumberToAssign } : {}),
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
        inspectionDate: true,
        certificateNumber: true,
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