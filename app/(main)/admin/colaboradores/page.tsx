import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle, User } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { collaboratorColumns } from "./_components/collaborator-datatable-column";
import { Button } from "@/components/ui/button";
import { ClientTable } from "@/components/client-table";
import { CoordinatorUp } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";

const CollaboratorPage = async () => {
  const session = await getServerSession(authOptions);
  const collaborators = await db.collaborator.findMany({
    where: {
      active: true,
    },
    include: {
      city: true,
    },
    orderBy: {
      fullname: "asc",
    },
  });
  return (
    <div className="container">
      <TitlePage icon={<User className="w-8 h-8" />} title="Colaboradores" description="Listado de colaboradores registrados en el sistema">
        <CoordinatorUp>
          <Link href="/admin/colaboradores/crear">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Agregar colaborador
            </Button>
          </Link>
        </CoordinatorUp>
      </TitlePage>

      <ClientTable columns={collaboratorColumns} data={collaborators} />
    </div>
  );
};

export default CollaboratorPage;
