"use client";

import { Collaborator, Certificate, TrainingCollaborator } from "@prisma/client";
import { Chart } from "@/components/chart";

interface CollaboratorWithFormated extends Collaborator {
  certificates: Certificate[];
  trainingCollaborators: TrainingCollaborator[];
}

interface CollaboratorsReportsProps {
  collaborators: CollaboratorWithFormated[];
  threshold: number;
}

export const CollaboratorFormed = ({
  collaborators,
  threshold,
}: CollaboratorsReportsProps) => {
  // Solo considerar colaboradores activos
  const activeCollaborators = collaborators.filter(col => col.active === true);
  console.log({activeCollaborators})

  const getCollaboratorStatus = () => {
    let formedCount = 0; // Tienen certificados
    let inTrainingCount = 0; // Inscritos en capacitaciones pero sin certificados
    let noActivityCount = 0; // Sin certificados ni capacitaciones

    activeCollaborators.forEach(collaborator => {
      const hasCertificates = collaborator.certificates.length > 0;
      const hasTrainings = collaborator.trainingCollaborators.length > 0;
      
      if (hasCertificates) {
        // Si tiene certificados, está formado
        formedCount++;
      } else if (hasTrainings) {
        // Si no tiene certificados pero sí capacitaciones, está en formación
        inTrainingCount++;
      } else {
        // Si no tiene certificados ni capacitaciones, sin actividad
        noActivityCount++;
      }
    });

    return { formedCount, inTrainingCount, noActivityCount };
  };

  const { formedCount, inTrainingCount, noActivityCount } = getCollaboratorStatus();
  const totalCount = activeCollaborators.length;

  // Calcular porcentajes
  const formedPercentage = totalCount > 0 ? (formedCount / totalCount) * 100 : 0;
  const inTrainingPercentage = totalCount > 0 ? (inTrainingCount / totalCount) * 100 : 0;
  const noActivityPercentage = totalCount > 0 ? (noActivityCount / totalCount) * 100 : 0;

  const chartData = [
    { 
      value: formedPercentage.toFixed(1), 
      name: "Formados", 
      count: formedCount,
      itemStyle: { color: "#10b981" } // Verde
    },
    { 
      value: inTrainingPercentage.toFixed(1), 
      name: "En formación", 
      count: inTrainingCount,
      itemStyle: { color: "#f59e0b" } // Ámbar
    },
    { 
      value: noActivityPercentage.toFixed(1), 
      name: "Sin actividad", 
      count: noActivityCount,
      itemStyle: { color: "#6b7280" } // Gris
    },
  ].filter(item => parseFloat(item.value) > 0); // Solo mostrar categorías con datos

  const option = {
    tooltip: {
      trigger: "item",
      formatter: function(params: any) {
        return `${params.name}: ${params.data.count} colaboradores (${params.percent}%)`;
      },
    },
    legend: {
      show: true,
      bottom: "0%",
      left: "center",
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: "Estado de Formación",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          fontWeight: "bold",
          fontSize: 12,
          formatter(param: any) {
            return `${param.data.count}`;
          },
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: totalCount !== 0 ? chartData : [],
      },
    ],
    title: {
      show: totalCount === 0,
      textStyle: {
        color: "grey",
        fontSize: 20,
      },
      text: "Sin datos",
      left: "center",
      top: "center",
    },
  };

  return <Chart option={option} title="Estado de Formación" />;
};
