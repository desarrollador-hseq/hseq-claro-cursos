"use client";

import React from "react";
import { Fade } from "react-awesome-reveal";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { useEppAnalytics } from "@/hooks/use-epp-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { EppAnalyticsCharts } from "@/components/charts/epp-analytics-charts";

export const EppInspectionsReports = () => {
  const { date } = useDashboard();

  // Convert date range to string format for API
  const dateFrom = date?.from?.toISOString();
  const dateTo = date?.to?.toISOString();

  const {
    data: analyticsData,
    loading,
    error,
  } = useEppAnalytics(dateFrom, dateTo);

  if (loading) {
    return (
      <div className="w-full flex flex-col justify-center mb-6" id="inspection">
        <div className="w-full grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 my-1 h-max md:my-3 place-content-center px-3">
          <div />
          <h2 className="text-3xl font-bold text-center">
            Inspecciones de equipos contra caídas
          </h2>
          <div className="place-content-center flex justify-center md:justify-end" />
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex flex-col justify-center mb-6" id="inspection">
        <div className="w-full grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 my-1 h-max md:my-3 place-content-center px-3">
          <div />
          <h2 className="text-3xl font-bold text-center">
            Inspecciones de equipos contra caídas
          </h2>
          <div className="place-content-center flex justify-center md:justify-end" />
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-center mb-6 mt-1" id="inspection">
      <div className="w-full flex justify-center px-3 mb-5">
        <div />
        <h2 className="text-3xl font-bold text-center">
          Inspecciones de equipos contra caídas
        </h2>
        <div className="place-content-center flex justify-center md:justify-end" />
      </div>

      {/* Charts Section */}
      {analyticsData && (
        <Fade delay={100} cascade triggerOnce>
          <div className="p-2">
            <EppAnalyticsCharts
              analyticsData={analyticsData}
              regionalData={analyticsData.regionalData}
              eppTypeData={analyticsData.eppTypeData}
              pieChartData={analyticsData.pieChartData}
            />
          </div>
        </Fade>
      )}
    </div>
  );
};
