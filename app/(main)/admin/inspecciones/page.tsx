import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle } from "lucide-react";
import { db } from "@/lib/db";
import { InspectionsDataTable } from "./_components/inspections-datatable";
import { InspectionColumns } from "./_components/inspections-datatable-column";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/auth-options";

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
    <Card className="max-w-[1500px] h-fit mx-auto p-1 rounded-sm">
      <CardHeader className="flex flex-row justify-between gap-y-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Listado de inspecciones</h1>
          <span className="text-sm text-slate-500 font-light">
            Listado completo de todas las inspecciones registradas hasta la
            fecha
          </span>
        </div>

        {session && session.user.role === "ADMIN" && (
          <Link href="/admin/inspecciones/crear">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Registrar Inspección
            </Button>
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <InspectionsDataTable
          columns={InspectionColumns}
          data={collaborators}
        />
      </CardContent>
    </Card>
  );
};

export default InspectionsPage;
