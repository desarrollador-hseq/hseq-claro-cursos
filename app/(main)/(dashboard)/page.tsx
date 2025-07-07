import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CollaboratorsReports } from "./_components/collaborators/collaborators-reports";
import { db } from "@/lib/db";
import { InspectionsReports } from "./_components/inspections/inspections-reports";
import { Separator } from "@/components/ui/separator";
import { ReportsChartReports } from "./_components/reports/reports-chart-reports";
import { Dashboardtitle } from "./_components/dashboard-title";
import { MonthlyReportsSection } from "./_components/monthly-reports/monthly-reports-section";
import { CetarDistribution } from "./_components/collaborators/cetar-distribution";

const DashboardPage = async () => {
  const collaborators = await db.collaborator.findMany({
    where: {
      // Traemos todos los colaboradores para mostrar certificados emitidos
      // independientemente de si están activos o no
    },
    include: {
      city: {
        include: {
          regional: true,
        },
      },
      certificates: {
        where: {
          active: true,
        },
      },
      trainingCollaborators: {
        where: {
          certificateIssued: true,
        },
      },
    },
  });
  const getFormationThreshold = async () => {
    try {
      const formationThreshold = await db.formationParameters.findFirst();
      return formationThreshold?.threshold;
    } catch (error) {
      console.error("Error al obtener el umbral de formación:", error);
      throw error;
    } finally {
      await db.$disconnect();
    }
  };
  const thresholdValue = await getFormationThreshold();
  const threshold = thresholdValue ? thresholdValue : 80;
  const inspections = await db.inspection.findMany({
    include: {
      city: true,
    },
  });
  const report = await db.report.findMany();

  const monthlyReports = await db.monthlyReports.findMany({
    where: {
      active: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  // Obtener datos para el gráfico CETAR vs UVAE
  const trainingCollaborators = await db.trainingCollaborator.findMany({
    where: {
      training: {
        active: true,
        status: {
          not: "CANCELLED"
        }
      }
    },
    include: {
      training: {
        select: {
          byCetar: true,
          status: true,
        },
      },
    },
  });

  const regionalFull = await db.regional.findMany({
    where: {
      active: true,
    
    },
    include: {
      cities: {
        include: {
          collaborators: true
        }
      }
    }
  })

  return (
    <div className="w-full">
      <Card className="relative w-full max-w-[1500px] m-auto overflow-hidden bg-slate-50 border-2 border-primary">
        <CardHeader className="p-0 ">
          <Dashboardtitle />
        </CardHeader>

        {/* <CollaboratorsCard /> */}
        <CardContent className="w-full grid grid-cols-1 p-2">
          {collaborators ? (
            <CollaboratorsReports
              threshold={threshold}
              collaborators={collaborators}
              regionalFull={regionalFull}
            />
          ) : (
            <div className="h-full w-full">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          )}
          <Separator className="h-1.5 bg-primary" />
             {/* Gráfico CETAR vs UVAE */}
             {trainingCollaborators && (
            <CetarDistribution trainingCollaborators={trainingCollaborators} />
          )}
          
          <Separator className="h-1.5 bg-primary" />
       
          {inspections && <InspectionsReports inspections={inspections} />}

          {/* <Separator className="h-1.5 bg-primary" /> */}
          {report && <ReportsChartReports reports={report} />}

          <Separator className="h-1.5 bg-primary flex justify-center" />
          {monthlyReports && (
            <MonthlyReportsSection monthlyReports={monthlyReports} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
