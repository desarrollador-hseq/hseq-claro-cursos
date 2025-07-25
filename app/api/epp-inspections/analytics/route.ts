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
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Validar fechas si se proporcionan
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return new NextResponse("Invalid dateFrom parameter", { status: 400 });
    }
    if (dateTo && isNaN(Date.parse(dateTo))) {
      return new NextResponse("Invalid dateTo parameter", { status: 400 });
    }

    // Construir filtros de fecha
    const dateFilter: any = {};
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom);
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo);
    }

    const whereClause = Object.keys(dateFilter).length > 0 
      ? { certificationDate: dateFilter, status: "VALIDATED" as const }
      : { status: "VALIDATED" as const };

    // 1. Inspecciones por regional
    const inspectionsByRegional = await db.eppCertificationInspection.groupBy({
      by: ['regionalId'],
      _count: {
        id: true
      },
      where: whereClause,
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Obtener nombres de regionales
    const regionalIds = inspectionsByRegional
      .map(item => item.regionalId)
      .filter((id): id is string => id !== null);
    
    const regionals = regionalIds.length > 0 ? await db.regional.findMany({
      where: {
        id: {
          in: regionalIds
        }
      },
      select: {
        id: true,
        name: true
      }
    }) : [];

    const regionalMap = new Map(regionals.map(r => [r.id, r.name]));
    
    const regionalData = inspectionsByRegional.map(item => ({
      regionalId: item.regionalId,
      regionalName: item.regionalId ? regionalMap.get(item.regionalId) || 'Sin Regional' : 'Sin Regional',
      count: item._count?.id || 0
    }));

    // 2. Inspecciones por tipo de EPP
    const inspectionsByEppType = await db.eppCertificationInspection.groupBy({
      by: ['eppType'],
      _count: {
        id: true
      },
      where: whereClause,
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    const eppTypeData = inspectionsByEppType.map(item => ({
      eppType: item.eppType,
      count: item._count?.id || 0
    }));

    // 3. Inspecciones aptas vs no aptas (gráfica de torta)
    const suitabilityData = await db.eppCertificationInspection.groupBy({
      by: ['isSuitable'],
      _count: {
        id: true
      },
      where: whereClause
    });

    const pieChartData = suitabilityData.map(item => ({
      label: item.isSuitable ? 'Aptos' : 'No Aptos',
      value: item._count?.id || 0,
      color: item.isSuitable ? '#10B981' : '#EF4444' // Verde para aptos, rojo para no aptos
    }));

    // 4. Estadísticas generales
    const totalInspections = await db.eppCertificationInspection.count({
      where: whereClause
    });

    const totalSuitable = await db.eppCertificationInspection.count({
      where: {
        ...whereClause,
        isSuitable: true
      }
    });

    const totalNotSuitable = await db.eppCertificationInspection.count({
      where: {
        ...whereClause,
        isSuitable: false
      }
    });

    const summaryStats = {
      total: totalInspections,
      suitable: totalSuitable,
      notSuitable: totalNotSuitable,
      suitabilityRate: totalInspections > 0 ? ((totalSuitable / totalInspections) * 100).toFixed(1) : '0'
    };

    return NextResponse.json({
      regionalData,
      eppTypeData,
      pieChartData,
      summaryStats,
      filters: {
        dateFrom,
        dateTo
      }
    });

  } catch (error) {
    console.error("[EPP_INSPECTIONS_ANALYTICS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 