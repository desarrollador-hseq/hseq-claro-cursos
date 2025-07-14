import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const certificate = await db.certificate.findUnique({
      where: { id: params.certificateId },
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

    if (!certificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(certificate);
  } catch (error) {
    console.error("Error obteniendo certificado:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const data = await request.json();

    // Verificar que el certificado existe
    const existingCertificate = await db.certificate.findUnique({
      where: { id: params.certificateId },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    // Si solo se está actualizando el campo downloaded, permitir a cualquier usuario autenticado
    if (Object.keys(data).length === 1 && 'downloaded' in data) {
      const updatedCertificate = await db.certificate.update({
        where: { id: params.certificateId },
        data: {
          downloaded: data.downloaded,
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

      return NextResponse.json(updatedCertificate);
    }

    // Para otros campos, solo coordinadores y admins pueden editar certificados
    if (!["ADMIN", "COORDINATOR"].includes(session.user.role || "")) {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    // Actualizar certificado
    const updatedCertificate = await db.certificate.update({
      where: { id: params.certificateId },
      data: {
        // Información del colaborador (como strings)
        collaboratorFullname: data.collaboratorFullname,
        collaboratorNumDoc: data.collaboratorNumDoc,
        collaboratorTypeDoc: data.collaboratorTypeDoc,
        collaboratorArlName: data.collaboratorArlName,
        companyName: data.companyName,
        legalRepresentative: data.legalRepresentative,
        companyNit: data.companyNit,
        collaboratorCityName: data.collaboratorCityName,
        
        // Información del curso (como strings)
        courseName: data.courseName,
        levelName: data.levelName,
        resolution: data.resolution,
        levelHours: data.levelHours,
        monthsToExpire: data.monthsToExpire,
        
        // Información del coach (como strings)
        coachName: data.coachName,
        coachPosition: data.coachPosition,
        coachDoc: data.coachDoc || "",
        coachLicence: data.coachLicence,
        coachImgSignatureUrl: data.coachImgSignatureUrl,
        
        // Fechas
        certificateDate: data.certificateDate ? new Date(data.certificateDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        expeditionDate: data.expeditionDate ? new Date(data.expeditionDate) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        
        // Estado
        // wasSent: data.wasSent,
        downloaded: data.downloaded,
        active: data.active,
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

    return NextResponse.json(updatedCertificate);
  } catch (error) {
    console.error("Error actualizando certificado:", error);
    return NextResponse.json(
      { message: "Error interno del servidor", error: error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Solo admins pueden eliminar certificados
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Sin permisos" }, { status: 403 });
    }

    // Verificar que el certificado existe
    const existingCertificate = await db.certificate.findUnique({
      where: { id: params.certificateId },
    });

    if (!existingCertificate) {
      return NextResponse.json(
        { message: "Certificado no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar certificado (soft delete)
    await db.certificate.update({
      where: { id: params.certificateId },
      data: { active: false },
    });

    return NextResponse.json({ message: "Certificado eliminado exitosamente" });
  } catch (error) {
    console.error("Error eliminando certificado:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 