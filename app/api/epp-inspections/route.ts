import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const eppType = searchParams.get('eppType');
    const isSuitable = searchParams.get('isSuitable');

    // Construir filtros dinámicamente
    const where: any = {};

    if (status && ['PENDING', 'VALIDATED', 'CANCELED'].includes(status)) {
      where.status = status;
    }

    if (eppType) {
      where.eppType = eppType;
    }

    if (isSuitable !== null && isSuitable !== undefined) {
      where.isSuitable = isSuitable === 'true';
    }

    if (search) {
      where.OR = [
        { collaboratorName: { contains: search, mode: 'insensitive' } },
        { collaboratorNumDoc: { contains: search } },
        { eppSerialNumber: { contains: search } },
        { eppBrand: { contains: search } },
        { inspectorName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calcular offset para paginación
    const offset = (page - 1) * limit;

    // Obtener total de registros para paginación
    const totalCount = await db.eppCertificationInspection.count({ where });

    // Obtener inspecciones con paginación
    const inspections = await db.eppCertificationInspection.findMany({
      where,
      select: {
        id: true,
        status: true,
        inspectionDate: true,
        certificationDate: true,
        collaboratorName: true,
        collaboratorNumDoc: true,
        collaboratorCityName: true,
        eppType: true,
        eppName: true,
        eppSerialNumber: true,
        eppBrand: true,
        inspectorName: true,
        isSuitable: true,
        sessionId: true,
        equipmentIndex: true,
        validatedBy: true,
        validatedAt: true,
        validationNotes: true,
        observations: true,
        createdAt: true,
        updatedAt: true,
        regional: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // Pending first
        { createdAt: 'desc' }
      ],
      skip: offset,
      take: limit
    });

    // Calcular información de paginación
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Estadísticas por estado
    const statusStats = await db.eppCertificationInspection.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: search || eppType || isSuitable ? where : {} // Solo aplicar filtros adicionales si existen
    });

    const stats = {
      total: totalCount,
      pending: statusStats.find(s => s.status === 'PENDING')?._count.status || 0,
      validated: statusStats.find(s => s.status === 'VALIDATED')?._count.status || 0,
      canceled: statusStats.find(s => s.status === 'CANCELED')?._count.status || 0
    };

    return NextResponse.json({
      inspections,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      },
      stats,
      filters: {
        status,
        search,
        eppType,
        isSuitable
      }
    });

  } catch (error) {
    console.error("[EPP_INSPECTIONS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 