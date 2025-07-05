import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CoordinatorUp } from "@/components/rbac-wrapper";
import TabsTrainingList from "./_components/tabs-training-list";

const TrainingPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <Card className="max-w-[1500px] h-fit mx-auto p-1 rounded-sm">
      <CardHeader className="flex flex-row justify-between gap-y-1">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold">Listado de capacitaciones</h1>
          <span className="text-sm text-slate-500 font-light">
            Listado completo de todas las capacitaciones registradas hasta la
            fecha
          </span>
        </div>

        <CoordinatorUp>
          <Link href="/admin/capacitaciones/registrar">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Agregar capacitación
            </Button>
          </Link>
        </CoordinatorUp>
      </CardHeader>
      <CardContent>
        <TabsTrainingList />
      </CardContent>
    </Card>
  );
};

export default TrainingPage;
