import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle } from "lucide-react";
import { ClientTable } from "@/components/client-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { coachesDataTableColumns } from "./_components/coaches-datatable-column";
import { AdminOnly } from "@/components/rbac-wrapper";

const CoachPage = async () => {
  const session = await getServerSession(authOptions);
  const coaches = await db.coach.findMany({
    where: {
      active: true,
    },
    orderBy: {
      fullname: "asc",
    },
  });
  return (
    <Card className="max-w-[1500px] h-fit mx-auto p-1 rounded-sm">
      <CardHeader className="flex flex-row justify-between gap-y-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Listado de entrenadores</h1>
          <span className="text-sm text-slate-500 font-light">
            Listado completo de todos lo entrenadores registrados hasta la fecha
          </span>
        </div>

        <AdminOnly>
          <Link href="/admin/entrenadores/registrar">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Agregar entrenador
            </Button>
          </Link>
        </AdminOnly>
      </CardHeader>
      <CardContent>
        <ClientTable columns={coachesDataTableColumns} data={coaches} />
      </CardContent>
    </Card>
  );
};

export default CoachPage;
