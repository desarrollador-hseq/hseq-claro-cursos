import { db } from "@/lib/db";
import { ReportsDataTable } from "./_components/reports-datatable";
import { reportColumns } from "./_components/reports-datatable-column";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const InspectionsPage = async () => {
  const reports = await db.report.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <Card className="max-w-[1500px] h-fit mx-auto p-1 rounded-sm">
      <CardHeader className="flex justify-between gap-y-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">
            Listado de informes de inspección
          </h1>
          <span className="text-sm text-slate-500 font-light">
            Listado completo de todos los informes de inspección registrados
            hasta la fecha
          </span>
        </div>

        {/* {session && session.user.role === "ADMIN" && (
          <Link href="/admin/informes/crear">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Informe
            </Button>
          </Link>
        )} */}
      </CardHeader>
      <CardContent>
        <ReportsDataTable columns={reportColumns} data={reports} />
      </CardContent>
    </Card>
  );
};

export default InspectionsPage;
