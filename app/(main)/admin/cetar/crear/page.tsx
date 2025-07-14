import React from "react";
import { AdminOnly } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";
import { School } from "lucide-react";
import { AddCetarForm } from "../_components/add-cetar-form";
import { getCities } from "@/actions/parameters";

const CreateCetarPage = async () => {
  const cities = await getCities();

  return (
    <div className="container">
      <TitlePage
        icon={<School className="w-8 h-8" />}
        title="Crear CETAR"
        description=""
      />
      <AdminOnly>
        <AddCetarForm cities={cities} />
      </AdminOnly>
    </div>
  );
};

export default CreateCetarPage;
