import React from "react";
import { db } from "@/lib/db";
import { AddCityForm } from "./_components/add-cities-form";

const CreateCity = async ({ params }: { params: { cityId: string } }) => {
  const city = await db.city.findUnique({
    where: {
      id: params.cityId,
    },
    include: {
      regional: true,
    },
  });

  if (!city) {
    params.cityId = "crear";
  }

  const regionals = await db.regional.findMany({ where: { active: true } });

  return (
    <div>
      {city ? (
        <AddCityForm city={city} regional={regionals} />
      ) : (
        <AddCityForm regional={regionals} />
      )}
    </div>
  );
};

export default CreateCity;
