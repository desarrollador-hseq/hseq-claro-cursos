"use client";

import React from "react";
import { Report } from "@prisma/client";
import { Fade } from "react-awesome-reveal";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { ReportsKpi } from "./reports-kpi";
import { ReportsDelivered } from "./reports-delivered";
import { ShowTableModal } from "../modals/show-table";
import { reportColumns } from "@/app/(main)/admin/informes/_components/reports-datatable-column";
import { ReportsDataTable } from "@/app/(main)/admin/informes/_components/reports-datatable";

interface ReportsChartReportsProps {
  reports: Report[];
}

export const ReportsChartReports = ({ reports }: ReportsChartReportsProps) => {
  const { date } = useDashboard();

  const filteredReports =
    !date || (date?.from === undefined && date?.to === undefined)
      ? reports
      : reports.filter((reports) => {
          const startDate = new Date(reports.deliveryDate);
          return (
            (!date.from || startDate >= date.from) &&
            (!date.to || startDate <= date.to)
          );
        });
  return (
    <div className="w-full flex flex-col justify-center mb-6">
      <div className="w-full grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 my-1 h-max md:my-3  place-content-center px-3 ">
        <div />
        <h2 className="text-3xl font-bold text-center">Informes de inspecciones</h2>
        <div className="place-content-center flex justify-center md:justify-end">
          <ShowTableModal title="Informes">
            <ReportsDataTable columns={reportColumns} data={filteredReports} />
          </ShowTableModal>
        </div>
      </div>

      {/* <Separator className="mb-4 bg-primary" /> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3 p-2">
        <Fade delay={200} cascade triggerOnce>
          <ReportsKpi reports={filteredReports} />
        </Fade>

        <Fade delay={400} cascade triggerOnce>
          <ReportsDelivered reports={filteredReports} />
        </Fade>
      </div>
    </div>
  );
};
