import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get("collaboratorId");
    const courseLevelId = searchParams.get("courseLevelId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      active: true,
    };

    if (collaboratorId) {
      where.collaboratorId = collaboratorId;
    }

    if (courseLevelId) {
      where.courseLevelId = courseLevelId;
    }

    // Obtener certificados
    const certificates = await db.certificate.findMany({
      where,
      include: {
        collaborator: {
          include: {
            city: {
              include: {
                regional: true,
              },
            },
          },
        },
        courseLevel: {
          include: {
            course: true,
          },
        },
        coach: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Contar total para paginación
    const totalCount = await db.certificate.count({ where });

    return NextResponse.json({
      certificates,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error obteniendo certificados:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Solo coordinadores y admins pueden crear certificados
    if (!["ADMIN", "COORDINATOR"].includes(session.user.role || "")) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    const data = await request.json();

    // Validar datos requeridos
    if (!data.collaboratorId || !data.courseLevelId) {
      return NextResponse.json(
        { message: "collaboratorId y courseLevelId son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un certificado
    const existingCertificate = await db.certificate.findFirst({
      where: {
        collaboratorId: data.collaboratorId,
        courseLevelId: data.courseLevelId,
        active: true,
      },
    });

    if (existingCertificate) {
      return NextResponse.json(
        { message: "Ya existe un certificado para este colaborador y nivel" },
        { status: 409 }
      );
    }

    // También verificar si tiene certificado CETAR
    const cetarCertificate = await db.cetarCertificate.findFirst({
      where: {
        collaboratorId: data.collaboratorId,
        courseLevelId: data.courseLevelId,
        active: true,
      },
    });

    if (cetarCertificate) {
      return NextResponse.json(
        { message: "Ya existe un certificado CETAR para este colaborador y nivel" },
        { status: 409 }
      );
    }

    // Crear certificado
    const certificate = await db.certificate.create({
      data: {
        collaboratorId: data.collaboratorId,
        courseLevelId: data.courseLevelId,
        coachId: data.coachId,
        
        // Información del colaborador (como strings)
        collaboratorFullname: data.collaboratorFullname,
        collaboratorNumDoc: data.collaboratorNumDoc,
        collaboratorTypeDoc: data.collaboratorTypeDoc,
        collaboratorCityName: data.collaboratorCityName,
        collaboratorArlName: data.collaboratorArlName || "",
        companyName: data.companyName || "CLARO COLOMBIA S.A.S",
        legalRepresentative: data.legalRepresentative || "",
        companyNit: data.companyNit || "800225440-9",
        
        // Información del curso (como strings)
        courseName: data.courseName,
        levelName: data.levelName,
        resolution: data.resolution,
        levelHours: data.levelHours,
        monthsToExpire: data.monthsToExpire,
        
        // Información del coach (como strings)
        coachName: data.coachName,
        coachPosition: data.coachPosition,
        coachLicence: data.coachLicence,
        coachImgSignatureUrl: data.coachImgSignatureUrl,
        
        // Fechas
        certificateDate: data.certificateDate ? new Date(data.certificateDate) : new Date(),
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        expeditionDate: data.expeditionDate ? new Date(data.expeditionDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        
        // Estado
        wasSent: data.wasSent || false,
        active: true,
      },
      include: {
        collaborator: {
          include: {
            city: {
              include: {
                regional: true,
              },
            },
          },
        },
        courseLevel: {
          include: {
            course: true,
          },
        },
        coach: true,
      },
    });

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Error creando certificado:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 