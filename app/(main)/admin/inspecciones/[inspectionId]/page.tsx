import React from "react";
import { db } from "@/lib/db";
import { AddInspectionForm } from "./_components/add-inspection-form";

const CreateInspection = async ({
  params,
}: {
  params: { inspectionId: string };
}) => {
  const inspection = await db.inspection.findUnique({
    where: {
      id: params.inspectionId,
    },
    include: {
      city: true,
    },
  });

  if (!inspection) {
    params.inspectionId = "crear";
  }

  const cities = await db.city.findMany({});

  return (
    <div>
      {inspection ? (
        <AddInspectionForm inspection={inspection} cities={cities} />
      ) : (
        <AddInspectionForm cities={cities} />
      )}
    </div>
  );
};

export default CreateInspection;
