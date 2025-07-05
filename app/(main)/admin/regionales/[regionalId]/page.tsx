import React from "react";
import { db } from "@/lib/db";
import { AddRegionalForm } from "./_components/add-regional-form";


const CreateCity = async ({ params }: { params: { regionalId: string } }) => {
  const regional = await db.regional.findUnique({
    where: {
      id: params.regionalId,
    },
    include: {
        cities: true
    }
  });

  if (!regional) {
    params.regionalId = "crear";
  }


  return (
    <div>
      {regional ? (
        <AddRegionalForm regional={regional} />
      ) : (
        <AddRegionalForm />
      )}
    </div>
  );
};

export default CreateCity;
