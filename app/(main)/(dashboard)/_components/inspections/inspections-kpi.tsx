
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Inspection } from "@prisma/client";

interface InspectionsReportsProps {
  inspections: Inspection[];
}

export const InspectionsKpi = ({
  inspections,
}: InspectionsReportsProps) => {
  
  let PercentageExecuted;
  const countExecutedInspections = () => {
    return inspections.reduce((count, inspection) => {
      if (inspection.isExecuted) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const executedCount = countExecutedInspections();



  if (inspections.length > 0) {
    PercentageExecuted = (executedCount / inspections.length) * 100;
  } else {
    PercentageExecuted = 0;
  }




  return (
    <>
      <Card className="h-full">
        <CardHeader></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3">
          {/* =============== 1 =============== */}
          <Card className={`${inspections.length > 0 ? "bg-secondary" : "bg-zinc-400"} rounded-lg text-white`}>
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Total Inspecciones</h4>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-4xl font-bold">
                {inspections.length}
              </p>
            </CardContent>
          </Card>
          {/* =============== 2 =============== */}
          <Card className={`${inspections.length > 0 ? "bg-secondary" : "bg-zinc-400"} rounded-lg text-white`}>
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Total Inspecciones ejecutadas</h4>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-4xl font-bold">
                {executedCount}
              </p>
            </CardContent>
          </Card>
          {/* =============== 3 =============== */}
          <Card className={`md:col-span-2 ${inspections.length > 0 ? "bg-secondary" : "bg-zinc-400"} rounded-lg text-white`}>
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Porcentaje de ejecución</h4>
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
