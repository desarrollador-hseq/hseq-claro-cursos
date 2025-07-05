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

    // Buscar el certificado más reciente activo para este colaborador y nivel
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

    if (!certificate) {
      return new NextResponse("Certificate not found", { status: 404 });
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("[CERTIFICATE_FIND]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 