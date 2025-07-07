import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle } from "lucide-react";
import { ClientTable } from "@/components/client-table";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { coachesDataTableColumns } from "./_components/coaches-datatable-column";
import TitlePage from "@/components/title-page";

const CoachPage = async () => {
  const coaches = await db.coach.findMany({
    where: {
      active: true,
    },
    orderBy: {
      fullname: "asc",
    },
  });
  return (
    <div className="container">
      <TitlePage
        title="Listado de entrenadores"
        description="Listado completo de todos lo entrenadores registrados hasta la fecha"
      >
        <Link href="/admin/entrenadores/registrar">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar entrenador
          </Button>
        </Link>
      </TitlePage>
      <ClientTable columns={coachesDataTableColumns} data={coaches} />
    </div>
  );
};

export default CoachPage;
