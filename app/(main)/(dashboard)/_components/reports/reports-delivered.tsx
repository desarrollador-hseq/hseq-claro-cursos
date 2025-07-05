"use client";

import { Report } from "@prisma/client";
import { Chart } from "@/components/chart";

interface ReportChartReportsProps {
  reports: Report[];
}

export const ReportsDelivered = ({ reports }: ReportChartReportsProps) => {

  const countExecutedInspections = () => {
    return reports.reduce((count, report) => {
      if (report.conformity) {
        return count + 1;
      }
      return count;
    }, 0);
  };

  const executedCount = countExecutedInspections();
  const totalCount = reports.length;
  const notExecutedCount = totalCount - executedCount;

  const chartData = [
    { value: executedCount, name: "Conformidad" },
    { value: notExecutedCount, name: "Sin Conformidad" },
  ];

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {d}%",
    },
    legend: {
      show: false,
      top: "5%",
      left: "center",
    },
    series: [
      {
        type: "pie",
        radius: "70%",
        avoidLabelOverlap: false,

        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
          label: {
            show: true,
            formatter(param: any) {
              return param.name + " - cant:  (" + param.value + ")";
            },
          },
        },
        labelLine: {
          show: true,
        },
        data: reports.length !== 0 ? chartData : [],
        color: ["#4e71b1", "#bae0fc"],
      },
    ],
    title: {
      show: reports.length === 0,
      textStyle: {
        color: "grey",
        fontSize: 20,
      },
      text: "Sin datos",
      left: "center",
      top: "center",
    },
  };

  return <Chart option={option} title="Estados" />;
};
