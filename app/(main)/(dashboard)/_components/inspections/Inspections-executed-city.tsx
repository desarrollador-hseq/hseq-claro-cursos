"use client";

import { City, Inspection } from "@prisma/client";
import { Chart } from "@/components/chart";

interface InspectionWithCity extends Inspection {
  city: City | null
}

interface InspectionsReportProps {
  inspections: InspectionWithCity[];
}

export const InspectionsExecutedCity = ({
  inspections,
}: InspectionsReportProps) => {

  const countInspectionsByCity = (inspections: InspectionWithCity[] ) => {
    const counts = inspections.reduce((acc: any, { city, isExecuted }: any) => {
      if (!acc[city.id]) {
        acc[city.id] = { executed: 0, notExecuted: 0, cityName: (city.realName) }; // Incluir el nombre de la ciudad
      }
      if (isExecuted) {
        acc[city.id].executed += 1;
      } else {
        acc[city.id].notExecuted += 1;
      }
      return acc;
    }, {});
  
    return Object.values(counts).map(({ cityName, executed, notExecuted }: any) => {
      return [cityName, executed, notExecuted]; // No incluir el nombre de la ciudad al final de cada fila
    });
  };
  
  const datasetSource = [
    ["Ciudad", "Ejecutadas", "Programadas"],
    ...countInspectionsByCity(inspections),
  ];
  
  const option = {
    legend: {},
    tooltip: {},
    dataset: {
      source: inspections.length !== 0 ? datasetSource : [],
    },
    xAxis: { type: "category" },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: any) => Math.round(value),
      },
      interval: 1,
    },
    series: [
      { type: "bar", name: "Ejecutadas", itemStyle: { color: "#4e71b1" } },
      { type: "bar", name: "Programadas", itemStyle: { color: "#bae0fc" } },
    ],
    title: {
      show: inspections.length === 0,
      textStyle: {
        color: "grey",
        fontSize: 20,
      },
      text: "Sin datos",
      left: "center",
      top: "center",
    },
  };
  return <Chart option={option} title="Estado por ciudades" />;
};
