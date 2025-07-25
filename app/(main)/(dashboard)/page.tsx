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
import { getCertificatesWithCourses } from "@/actions/certificates.action";
import { EppInspectionsReports } from "./_components/inspections/epp-inspection-report";

const DashboardPage = async () => {
  const collaborators = await db.collaborator.findMany({
    where: {
     active: true,
    },
    select: {
      id: true,
      active: true,
      name: true,
      lastname: true,

      city: {
        include: {
          regional: true,
        },
      },
      certificates: {
        where: {
          active: true,
        },
        select: {
          id: true,
          active: true,
          certificateDate: true,
          startDate: true,
          dueDate: true,
          downloaded: true,
        },
      },
      trainingCollaborators: {
        select: {
          id: true,
          certificateIssued: true,
          completionDate: true,
          status: true,
          createdAt: true,
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

  // Obtener certificados para el gráfico por curso
  const certificatesData = await getCertificatesWithCourses();

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
              certificates={certificatesData.certificates}
              cetarCertificates={certificatesData.cetarCertificates}
            />
          ) : (
            <div className="h-full w-full">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          )}
          {/* <Separator className="h-1.5 bg-primary my-3" /> */}
             {/* Gráfico CETAR vs UVAE */}
             {trainingCollaborators && (
            <CetarDistribution trainingCollaborators={trainingCollaborators} />
          )}
          
          <Separator className="h-1.5 bg-primary my-3" />
       
          {/*============ UVAE Inspections Reports ============*/}
          {inspections && <InspectionsReports inspections={inspections} />}

          {/*============ EPP Inspections Reports ============*/}
          <Separator className="h-1.5 bg-primary my-3" />
          {<EppInspectionsReports  />}

          {/*============ Reports Reports ============*/}
          <Separator className="h-1.5 bg-primary my-3" />
          {report && <ReportsChartReports reports={report} />}

          {/*============ Monthly Reports ============*/}
          <Separator className="h-1.5 bg-primary my-3 flex justify-center" />
          {monthlyReports && (
            <MonthlyReportsSection monthlyReports={monthlyReports} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
