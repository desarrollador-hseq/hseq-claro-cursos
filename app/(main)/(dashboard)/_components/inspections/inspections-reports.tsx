"use client";

import React from "react";
import { City, Inspection } from "@prisma/client";
import { Fade } from "react-awesome-reveal";
import { InspectionsExecutedCity } from "./Inspections-executed-city";
import { InspectionsCity } from "./inspections-city";
import { InspectionsKpi } from "./inspections-kpi";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { InspectionsExecuted } from "./inspections-executed";
import { ShowTableModal } from "../modals/show-table";
import { InspectionsDataTable } from "@/app/(main)/admin/inspecciones/_components/inspections-datatable";
import { InspectionColumns } from "@/app/(main)/admin/inspecciones/_components/inspections-datatable-column";

interface InspectionWithCity extends Inspection {
  city: City | null;
}

interface InspectionsReportsProps {
  inspections: InspectionWithCity[];
}

export const InspectionsReports = ({
  inspections,
}: InspectionsReportsProps) => {
  const { date } = useDashboard();

  const filteredInspections =  !date || (date?.from === undefined && date?.to === undefined)
  ? inspections
  : inspections.filter((inspections) => {
      const startDate = new Date(inspections.date);
      return (
        (!date.from || startDate >= date.from) &&
        (!date.to || startDate <= date.to)
      );
    });
  return (
    <div className="w-full flex flex-col justify-center mb-6" id="inspection">
      <div className="w-full grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 my-1 h-max md:my-3  place-content-center px-3 ">
        <div />
        <h2 className="text-3xl font-bold text-center">Inspecciones</h2>
        <div className="place-content-center flex justify-center md:justify-end">
          <ShowTableModal title="Inspecciones">
            <InspectionsDataTable
              columns={InspectionColumns}
              data={filteredInspections}
            />
          </ShowTableModal>
        </div>
      </div>

      {/* <Separator className="mb-4 bg-primary" /> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3 p-2">
        <Fade delay={200} cascade triggerOnce>
          <InspectionsKpi inspections={filteredInspections} />
        </Fade>

        <Fade delay={400} cascade triggerOnce>
          <InspectionsExecuted inspections={filteredInspections} />
        </Fade>

        <Fade delay={600} cascade triggerOnce>
          <InspectionsCity inspections={filteredInspections} />
        </Fade>

        <Fade delay={800} cascade triggerOnce>
          <InspectionsExecutedCity inspections={filteredInspections} />
        </Fade>
      </div>
    </div>
  );
};
