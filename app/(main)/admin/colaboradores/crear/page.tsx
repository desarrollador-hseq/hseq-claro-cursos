import TitlePage from "@/components/title-page";
import { AddCollaboratorForm } from "../[collaboratorId]/_components/add-collaborator-form";
import { db } from "@/lib/db";
import { PlusCircle, User } from "lucide-react";
import { CoordinatorUp } from "@/components/rbac-wrapper";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const CreateCollaborator = async () => {
  const cities = await db.city.findMany({
    where: {
      active: true,
    },
  });

  return (
    <div className="container">
      <TitlePage
        icon={<User className="w-8 h-8" />}
        title="Registrar colaborador"
        description=""
      >
        <CoordinatorUp>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/admin/colaboradores/crear/carga-masiva"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Carga masiva
          </Link>
        </CoordinatorUp>
      </TitlePage>

      <AddCollaboratorForm cities={cities || []} />
    </div>
  );
};

export default CreateCollaborator;
