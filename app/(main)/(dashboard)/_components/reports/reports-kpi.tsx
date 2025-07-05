

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {  Report } from "@prisma/client";


interface InspectionsReportsProps {
  reports: Report[];
}

export const ReportsKpi = ({
    reports,
}: InspectionsReportsProps) => {
  
  let PercentageExecuted;
  const countExecutedInspections = () => {
    return reports.reduce((count, report) => {
      if (report.conformity) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const executedCount = countExecutedInspections();



  if (reports.length > 0) {
    PercentageExecuted = (executedCount / reports.length) * 100;
  } else {
    PercentageExecuted = 0;
  }


  return (
    <>
      <Card className="h-full">
        <CardHeader></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3">
          {/* =============== 1 =============== */}
          <Card className={`${reports.length > 0 ? "bg-secondary" : "bg-zinc-400"} rounded-lg text-white`}>
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Total de informes</h4>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-4xl font-bold">
                {reports.length}
              </p>
            </CardContent>
          </Card>
          {/* =============== 2 =============== */}
          <Card className={`${reports.length > 0 ? "bg-secondary" : "bg-zinc-400"} rounded-lg text-white`}>
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Total informes aceptados</h4>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-4xl font-bold">
                {executedCount}
              </p>
            </CardContent>
          </Card>
          {/* =============== 3 =============== */}
          <Card className={`md:col-span-2 ${reports.length > 0 ? "bg-secondary" : "bg-zinc-400"} rounded-lg text-white`}>
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Porcentaje de conformidad</h4>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-4xl font-bold">
              {PercentageExecuted.toFixed(0)}%
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );
};
