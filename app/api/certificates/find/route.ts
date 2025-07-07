import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const collaboratorId = searchParams.get("collaboratorId");
    const courseLevelId = searchParams.get("courseLevelId");

    if (!collaboratorId || !courseLevelId) {
      return new NextResponse("Missing collaboratorId or courseLevelId", { status: 400 });
    }

    // Buscar certificado regular activo
    const certificate = await db.certificate.findFirst({
      where: {
        collaboratorId,
        courseLevelId,
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Si no encontramos certificado regular, buscar certificado CETAR
    if (!certificate) {
      const cetarCertificate = await db.cetarCertificate.findFirst({
        where: {
          collaboratorId,
          courseLevelId,
          active: true,
        },
        include: {
          training: true,
          collaborator: true,
          courseLevel: {
            include: {
              course: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (cetarCertificate) {
        // Retornar información del certificado CETAR en formato compatible
        return NextResponse.json({
          id: cetarCertificate.id,
          type: "cetar",
          certificateUrl: cetarCertificate.certificateUrl,
          collaboratorId: cetarCertificate.collaboratorId,
          courseLevelId: cetarCertificate.courseLevelId,
          certificateDate: cetarCertificate.certificateDate,
          expeditionDate: cetarCertificate.expeditionDate,
          dueDate: cetarCertificate.dueDate,
          createdAt: cetarCertificate.createdAt,
          training: cetarCertificate.training,
          collaborator: cetarCertificate.collaborator,
          courseLevel: cetarCertificate.courseLevel,
        });
      }

      return new NextResponse("Certificate not found", { status: 404 });
    }

    return NextResponse.json({
      ...certificate,
      type: "regular",
    });
  } catch (error) {
    console.error("[CERTIFICATE_FIND]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 