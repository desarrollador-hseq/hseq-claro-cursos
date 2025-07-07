import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle } from "lucide-react";
import { db } from "@/lib/db";
import { InspectionsDataTable } from "./_components/inspections-datatable";
import { InspectionColumns } from "./_components/inspections-datatable-column";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/auth-options";
import TitlePage from "@/components/title-page";

const InspectionsPage = async () => {
  const session = await getServerSession(authOptions);

  const collaborators = await db.inspection.findMany({
    include: {
      city: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="container">
      <TitlePage
        title="Inspecciones"
        description="Listado completo de todas las inspecciones registradas hasta la fecha"
      >
        <Link href="/admin/inspecciones/crear">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar inspección
          </Button>
        </Link>
      </TitlePage>
      <InspectionsDataTable columns={InspectionColumns} data={collaborators} />
    </div>
  );
};

export default InspectionsPage;
