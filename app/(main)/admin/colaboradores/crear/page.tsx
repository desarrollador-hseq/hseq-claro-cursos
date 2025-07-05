import TitlePage from "@/components/title-page";
import { AddCollaboratorForm } from "../[collaboratorId]/_components/add-collaborator-form";
import { db } from "@/lib/db";
import { User } from "lucide-react";

const CreateCollaborator = async () => {
  const cities = await db.city.findMany({
    where: {
      active: true,
    },
  });

  return (
    <div className="container">
      <TitlePage icon={<User className="w-8 h-8" />} title="Registrar colaborador" description="" />

      <AddCollaboratorForm cities={cities || []} />
    </div>
  );
};

export default CreateCollaborator;
