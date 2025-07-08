"use client";

import { ClientTable } from "@/components/client-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trainingDatatableColumn } from "./training-datatable-column";
import { useEffect, useState } from "react";
import { Training, TrainingStatus } from "@prisma/client";
import { getTrainings } from "@/actions/trainings.action";
import useTabs from "@/hooks/use-tabs";

const getTrainingsByStatus = async (status: TrainingStatus) => {
  const trainings = await getTrainings({ status });
  return trainings;
};

const TabsTrainingList = () => {
  const { activeTab, handleTabChange } = useTabs({ initialTab: "PLANNED" });
  const [trainings, setTrainings] = useState<Training[]>([]);

  useEffect(() => {
    const fetchTrainings = async () => {
      const trainings = await getTrainingsByStatus(activeTab as TrainingStatus);
      setTrainings(trainings);
    };
    fetchTrainings();
  }, [activeTab]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="all">Todos</TabsTrigger>
        <TabsTrigger value="PLANNED">Planificados</TabsTrigger>
        <TabsTrigger value="IN_PROGRESS">En progreso</TabsTrigger>
        <TabsTrigger value="COMPLETED">Completados</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <ClientTable columns={trainingDatatableColumn} data={trainings as any} />
      </TabsContent>
      <TabsContent value="PLANNED">
        <ClientTable columns={trainingDatatableColumn} data={trainings as any} />
      </TabsContent>
      <TabsContent value="IN_PROGRESS">
        <ClientTable columns={trainingDatatableColumn} data={trainings as any} />
      </TabsContent>
      <TabsContent value="COMPLETED">
        <ClientTable columns={trainingDatatableColumn} data={trainings as any} />
      </TabsContent>
    </Tabs>
  );
};

export default TabsTrainingList;
