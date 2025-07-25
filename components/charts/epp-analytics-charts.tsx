"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Pie } from "react-chartjs-2";
import { Card, CardContent, CardHeader } from "../ui/card";
import { EppAnalyticsData } from "@/hooks/use-epp-analytics";
import { Fade } from "react-awesome-reveal";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  ChartDataLabels
);

interface RegionalData {
  regionalId: string | null;
  regionalName: string;
  count: number;
}

interface EppTypeData {
  eppType: string;
  count: number;
}

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface EppAnalyticsChartsProps {
  regionalData: RegionalData[];
  eppTypeData: EppTypeData[];
  pieChartData: PieChartData[];
  analyticsData: EppAnalyticsData;
}

export const RegionalBarChart: React.FC<{ data: RegionalData[] }> = ({
  data,
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartData = {
    labels: data.map((item) => item.regionalName),
    datasets: [
      {
        label: "Inspecciones por Regional",
        data: data.map((item) => item.count),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      title: {
        display: false,
        text: "Inspecciones por Regional",
        style: {
          marginTop: "10px",
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const count = context.parsed.y;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
            return `${context.dataset.label}: ${count} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: {
          weight: 700,
          size: 16
        }
      }
      // datalabels: {
      //   display: true,
      //   color: '#000',
      //   anchor: 'end',
      //   align: 'top',
      //   offset: 4,
      //   formatter: function(value: number) {
      //     const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      //     return `${value}\n(${percentage}%)`;
      //   }
      // }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const EppTypeBarChart: React.FC<{ data: EppTypeData[] }> = ({
  data,
}) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  const chartData = {
    labels: data.map((item) => item.eppType.replace(/_/g, " ")),
    datasets: [
      {
        label: "Inspecciones por Tipo de EPP",
        data: data.map((item) => item.count),
        backgroundColor: "#4e71b1",
        borderColor: "#4e71b1",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      title: {
        display: false,
        text: "Inspecciones por Tipo de EPP",
        style: {
          marginTop: "10px",
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const count = context.parsed.y;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
            return `${context.dataset.label}: ${count} (${percentage}%)`;
          }
        }
      },
      datalabels: {
        display: true,
        color: '#fff',
        font: {
          weight: 700,
          size: 16
        }
      }
      // datalabels: {
      //   display: true,
      //   color: '#000',
      //   anchor: 'end',
      //   align: 'top',
      //   offset: 4,
      //   formatter: function(value: number) {
      //     const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
      //     return `${value}\n(${percentage}%)`;
      //   }
      // }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export const SuitabilityPieChart: React.FC<{ data: PieChartData[] }> = ({
  data,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const chartData = {
    labels: data.map((item) => item.label),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: {
        display: false,
        text: "Distribución Aptos vs No Aptos",
        style: {
          marginTop: "10px",
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      },
     
      datalabels: {
        display: true,
        color: '#fff',
        font: {
          weight: 700,
          size: 12
        },
        formatter: function(value: number) {
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
          return `${value}\n(${percentage}%)`;
        }
      }
    },
  };

  return (
    <Pie
      className="max-w-[300px] max-h-[300px]"
      data={chartData}
      options={options}
    />
  );
};

export const EppAnalyticsCharts: React.FC<EppAnalyticsChartsProps> = ({
  regionalData,
  eppTypeData,
  pieChartData,
  analyticsData,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Fade delay={200} cascade triggerOnce>
        <Card className="h-full">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-6 ">
            {/* =============== 1 =============== */}
            <Card
              className={`${
                analyticsData?.summaryStats?.total !== 0
                  ? "bg-secondary"
                  : "bg-zinc-400"
              } rounded-lg text-white`}
            >
              <CardHeader className="flex justify-center font-semibold ">
                <h4 className="text-center">Total Inspecciones</h4>
              </CardHeader>
              <CardContent className="flex justify-center ">
                <p className="text-4xl font-bold">
                  {analyticsData?.summaryStats.total}
                </p>
              </CardContent>
            </Card>
            <Card
              className={`${
                analyticsData?.summaryStats?.suitabilityRate !== "0"
                  ? "bg-secondary"
                  : "bg-zinc-400"
              } rounded-lg text-white`}
            >
              <CardHeader className="flex justify-center font-semibold ">
                <h4 className="text-center">Tasa de Aptitud</h4>
              </CardHeader>
              <CardContent className="flex justify-center">
                <p className="text-4xl font-bold">
                  {analyticsData?.summaryStats?.suitabilityRate}%
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Fade>
      <Fade delay={400} cascade triggerOnce>
        <Card className="h-full">
          <CardHeader className="border-b flex justify-center ">
            <span className="font-bold text-xl">Inspecciones por Regional</span>
          </CardHeader>
          <CardContent className="pt-6">
            <RegionalBarChart data={regionalData} />
          </CardContent>
        </Card>
      </Fade>
      <Fade delay={600} cascade triggerOnce>
        <Card className="h-full">
          <CardHeader className="border-b flex justify-center ">
            <span className="font-bold text-xl">
              Inspecciones por Tipo de EPP
            </span>
          </CardHeader>
          <CardContent className="pt-6">
            <EppTypeBarChart data={eppTypeData} />
          </CardContent>
        </Card>
      </Fade>
      <Fade delay={800} cascade triggerOnce>
        <Card className="h-full">
          <CardHeader className="border-b flex justify-center ">
            <span className="font-bold text-xl">
              Distribución por estado <span className="font-normal">(Aptos vs No Aptos)</span>
            </span>
          </CardHeader>
          <CardContent className="pt-6 flex justify-center">
            <SuitabilityPieChart data={pieChartData} />
          </CardContent>
        </Card>
      </Fade>
    </div>
  );
};
