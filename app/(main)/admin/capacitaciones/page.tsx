import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { PlusCircle } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { Button } from "@/components/ui/button";

import TabsTrainingList from "./_components/tabs-training-list";
import TitlePage from "@/components/title-page";

const TrainingPage = async () => {
  const session = await getServerSession(authOptions);

  return (
    <div className="container">
      <TitlePage
        title="Listado de capacitaciones"
        description="Listado completo de todas las capacitaciones registradas hasta la fecha"
      >
        <Link href="/admin/capacitaciones/registrar">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Registrar capacitación
          </Button>
        </Link>
      </TitlePage>
      <TabsTrainingList />
    </div>
  );
};

export default TrainingPage;
