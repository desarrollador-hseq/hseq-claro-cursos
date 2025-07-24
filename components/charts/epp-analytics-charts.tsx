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
import { Bar, Pie } from "react-chartjs-2";
import { Card, CardContent, CardHeader } from "../ui/card";
import { EppAnalyticsData } from "@/hooks/use-epp-analytics";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
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
      },
      title: {
        display: true,
        text: "Inspecciones por Regional",
      },
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
  const chartData = {
    labels: data.map((item) => item.eppType.replace(/_/g, " ")),
    datasets: [
      {
        label: "Inspecciones por Tipo de EPP",
        data: data.map((item) => item.count),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Inspecciones por Tipo de EPP",
      },
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
        display: true,
        text: "Distribución Aptos vs No Aptos",
      },
    },
  };

  return (
    <Pie
      className="max-w-[400px] max-h-[400px]"
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <Card className="h-full">
          <CardHeader></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3">
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
              <CardContent className="flex justify-center">
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
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <RegionalBarChart data={regionalData} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <EppTypeBarChart data={eppTypeData} />
      </div>
      <div className="bg-white p-4 rounded-lg shadow flex justify-center items-center">
        <SuitabilityPieChart data={pieChartData} />
      </div>
    </div>
  );
};
