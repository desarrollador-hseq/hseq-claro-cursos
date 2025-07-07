import { db } from "@/lib/db";
import { ReportsDataTable } from "./_components/reports-datatable";
import { reportColumns } from "./_components/reports-datatable-column";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TitlePage from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

const InspectionsPage = async () => {
  const reports = await db.report.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="container">
      <TitlePage
        title="Informes de inspección"
        description="Listado completo de todos los informes de inspección registrados hasta la fecha"
      >
        <Link href="/admin/informes/crear">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar informe
          </Button>
        </Link>
      </TitlePage>
      <ReportsDataTable columns={reportColumns} data={reports} />
    </div>
  );
};

export default InspectionsPage;
