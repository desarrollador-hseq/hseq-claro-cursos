"use client";

import { Chart } from "@/components/chart";

interface CetarDistributionProps {
  trainingCollaborators: {
    certificateIssued: boolean;
    training: {
      byCetar: boolean;
      status: string;
    };
  }[];
}

export const CetarDistribution = ({
  trainingCollaborators,
}: CetarDistributionProps) => {
  const processData = () => {
    // Contar colaboradores por tipo de capacitación
    const cetarCount = trainingCollaborators.filter(
      (tc) => tc.training.byCetar && tc.certificateIssued
    ).length;
    const uvaeCount = trainingCollaborators.filter(
      (tc) => !tc.training.byCetar && tc.certificateIssued
    ).length;

    const total = cetarCount + uvaeCount;

    if (total === 0) {
      return [];
    }

    return [
      {
        name: "CETAR",
        value: cetarCount,
        percentage: ((cetarCount / total) * 100).toFixed(1),
      },
      {
        name: "UVAE",
        value: uvaeCount,
        percentage: ((uvaeCount / total) * 100).toFixed(1),
      },
    ];
  };

  const chartData = processData();
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const option = {
    tooltip: {
      trigger: "item",
      formatter: function (params: any) {
        return `${params.name}<br/>
                Colaboradores: ${params.value}<br/>
                Porcentaje: ${params.percent}%`;
      },
    },
    legend: {
      top: "5%",
      left: "center",
      textStyle: {
        fontSize: 14,
        fontWeight: "bold",
      },
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "80%"], // Gráfico de dona
        avoidLabelOverlap: false,
        center: ["50%", "60%"],
        label: {
          show: true,
          position: "center",
          formatter: function (params: any) {
            if (params.dataIndex === 0) {
              return `{title|Total}\n{value|${total}}\n{subtitle|Colaboradores}`;
            }
            return "";
          },
          rich: {
            title: {
              fontSize: 16,
              fontWeight: "bold",
              color: "#333",
            },
            value: {
              fontSize: 24,
              fontWeight: "bold",
              color: "#2563eb",
              lineHeight: 30,
            },
            subtitle: {
              fontSize: 12,
              color: "#666",
              lineHeight: 20,
            },
          },
        },
        emphasis: {
          label: {
            show: false,
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        labelLine: {
          show: false,
        },
        data: chartData,
        color: [
          "#10b981", // Verde para CETAR
          "#f59e0b", // Naranja para UVAE
        ],
      },
    ],
    title: {
      show: chartData.length === 0,
      textStyle: {
        color: "grey",
        fontSize: 20,
      },
      text: "Sin datos disponibles",
      left: "center",
      top: "center",
    },
  };

  return (
    <div className="space-y-4">
      {/* Gráfico de dona */}
      <Chart
        option={option}
        title={
          <div className="flex flex-col">
            <span>Distribución por Tipo de Capacitación</span>
            <span className="text-sm text-gray-500 font-normal">
              {trainingCollaborators.length} capacitaciones
            </span>
          </div>
        }
        className="min-h-[400px]"
      >
        {/* Tarjetas KPI */}
        <div className="grid grid-cols-2 gap-4 w-1/2 m-auto mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <p className="text-green-600 text-sm font-medium">CETAR</p>
              <p className="text-2xl font-bold text-green-800">
                {chartData.find((item) => item.name === "CETAR")?.value || 0}
              </p>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {chartData.find((item) => item.name === "CETAR")?.percentage || 0}
              % del total
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <p className="text-orange-600 text-sm font-medium">UVAE</p>
              <p className="text-2xl font-bold text-orange-800">
                {chartData.find((item) => item.name === "UVAE")?.value || 0}
              </p>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {chartData.find((item) => item.name === "UVAE")?.percentage || 0}%
              del total
            </p>
          </div>
        </div>
      </Chart>
    </div>
  );
};
