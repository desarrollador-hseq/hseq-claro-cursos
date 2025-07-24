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
    <div className="w-full flex flex-col justify-center mb-6" id="inspection">
      <div className="w-full grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 my-1 h-max md:my-3 place-content-center px-3">
        <div />
        <h2 className="text-3xl font-bold text-center">
          Inspecciones de equipos contra caídas
        </h2>
        <div className="place-content-center flex justify-center md:justify-end" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 p-2">
        {/* <Fade delay={400} cascade triggerOnce>
          <Card>
            <CardHeader>
              <CardTitle>Inspecciones por Regional</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.regionalData && analyticsData.regionalData.length > 0 ? (
                <div className="space-y-2">
                  {analyticsData.regionalData.map((regional, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{regional.regionalName}</span>
                      <span className="font-semibold">{regional.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>
        </Fade> */}

        {/* <Fade delay={600} cascade triggerOnce>
          <Card>
            <CardHeader>
              <CardTitle>Inspecciones por Tipo de EPP</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.eppTypeData && analyticsData.eppTypeData.length > 0 ? (
                <div className="space-y-2">
                  {analyticsData.eppTypeData.map((eppType, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{eppType.eppType.replace(/_/g, ' ')}</span>
                      <span className="font-semibold">{eppType.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>
        </Fade> */}

        {/* <Fade delay={800} cascade triggerOnce>
          <Card>
            <CardHeader>
              <CardTitle>Distribución Aptos vs No Aptos</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.pieChartData && analyticsData.pieChartData.length > 0 ? (
                <div className="space-y-2">
                  {analyticsData.pieChartData.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No hay datos disponibles</p>
              )}
            </CardContent>
          </Card>
        </Fade> */}
      </div>

      {/* Charts Section */}
      {analyticsData && (
        <Fade delay={1000} cascade triggerOnce>
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
