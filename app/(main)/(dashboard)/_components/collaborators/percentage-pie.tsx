"use client";

import { Collaborator } from "@prisma/client";
import { Chart } from "@/components/chart";

interface CollaboratorsReportsProps {
  collaborators: Collaborator[];
}

export const PercentagePie = ({ collaborators }: CollaboratorsReportsProps) => {
  const processData = () => {
    const groupedData = collaborators.reduce((acc: any, collaborator) => {
      const key = `${collaborator.percentage}% Formación`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const sortedData = Object.entries(groupedData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const percentageA = parseInt(a.name);
        const percentageB = parseInt(b.name);
        return percentageA - percentageB;
      });

    return sortedData;
  };

  const chartData = processData();

  const option = {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["30%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
        color: [
          "#A5BFE6", //
          "#98B0D3", //
          "#6E7F98", //
          "#525F6F", //
          "#3D4753",
          "#282F37",
          "#D95043", //
          "#C72626", //
          "#9E3A31", //
          "#8C1B1B", //
          "#461A16", //
        ],
      },
    ],
    title: {
      show: chartData.length === 0,
      textStyle: {
        color: "grey",
        fontSize: 20,
      },
      text: "Sin datos",
      left: "center",
      top: "center",
    },
  };

  return <Chart option={option} title="Estado por ciudad" />;
};
