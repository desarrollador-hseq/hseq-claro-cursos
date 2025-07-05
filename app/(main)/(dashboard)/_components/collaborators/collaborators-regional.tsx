"use client";

import { Collaborator, City, Regional } from "@prisma/client";
import { Chart } from "@/components/chart";
import { CollaboratorsRegionalMenu } from "./collaborators-regional-menu";

interface CollaboratorWithFormated extends Collaborator {
  city: (City & { regional: Regional | null }) | null;
}
interface RegionalWithCollaborator extends Regional {
  cities: (City & { collaborators: Collaborator[] | null | undefined } | null | undefined)[];
}
interface CollaboratorsReportsProps {
  collaborators: CollaboratorWithFormated[];
  regionalsFull: RegionalWithCollaborator[] | null | undefined;
}

export const CollaboratorsRegional = ({
  collaborators,
  regionalsFull,
}: CollaboratorsReportsProps) => {
  const processDataForBarChart = () => {
    const regionalData = collaborators.map((collaborator) => {
      const regionalName = collaborator.city?.regional?.name || "Desconocida";

      return {
        regionalName,
        count: 1,
      };
    });

    const countsByRegional = regionalData.reduce(
      (acc: any, { regionalName, count }) => {
        acc[regionalName] = (acc[regionalName] || 0) + count;
        return acc;
      },
      {}
    );

    const regionals = Object.keys(countsByRegional);
    const counts = Object.values(countsByRegional);

    return { regionals, counts };
  };

  const { regionals, counts } = processDataForBarChart();

  const col = [
    "#FF8E33",
    "#33FF8B",
    "#8833FF",
    "#FF3363",
    "#33FF70",
    "#FF5733",
    "#33FF57",
  ];

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: regionals.length > 5 ? "6%" : "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: regionals.map((r) => r.toUpperCase()),
      axisTick: {
        alignWithLabel: true,
      },
      axisLabel: {
        rotate: regionals.length > 5 ? 30 : 0,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: (value: any) => Math.round(value),
      },
      show: false,
    },

    series: [
      {
        label: {
          show: false,
        },
        data: regionals.map((regional, index) => ({
          value: counts[index],
          itemStyle: { color: col[index] },
          name: regional,
        })),
        barMaxWidth: regionals.length > 6 ? "" : "30%",
        type: "bar",
        color: "#fff",
      },
    ],
    title: {
      show: counts.length === 0,
      textStyle: {
        color: "#808080",
        fontSize: 18,
      },
      text: "Sin datos",
      left: "center",
      top: "center",
    },
  };

  return (
    <Chart
      option={option}
      title={
        <div className="flex flex-col items-center gap-3">
          <span>Número de colaboradores por regional</span>
          <CollaboratorsRegionalMenu regionals={regionalsFull} />
          <div />
        </div>
      }
    />
  );
};
