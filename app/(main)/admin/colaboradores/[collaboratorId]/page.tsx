import React from "react";
import { db } from "@/lib/db";
import { User } from "lucide-react";
import { CreateCollaboratorForm } from "../_components/create-collaborator-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import TitlePage from "@/components/title-page";

const CreateCollaborator = async ({
  params,
}: {
  params: { collaboratorId: string };
}) => {
  const collaborator = await db.collaborator.findUnique({
    where: {
      id: params.collaboratorId,
    },
    include: {
      city: {
        select: {
          realName: true,
        },
      },
    },
  });

  if (!collaborator) {
    params.collaboratorId = "crear";
  }

  const cities = await db.city.findMany({
    where: {
      active: true,
    },
    orderBy: {
      realName: "asc",
    },
  });

  if (!collaborator) {
    return <div>Colaborador no encontrado</div>;
  }

  return (
    <div className="container">
      <TitlePage icon={<User className="w-8 h-8" />} title="Editar colaborador" description="" />
      <div className="w-full flex flex-col gap-5">
        <Tabs
          defaultValue="info"
          className="w-full flex flex-col items-center "
        >
          <TabsList className="w-[70%] my-2 relative">
            <TabsTrigger className="w-full" value="info">
              Información
            </TabsTrigger>

            <TabsTrigger
              className="w-full "
              // disabled={collaborator.percentage === 0}
              value="courses"
            >
              Cursos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="w-full">
            <CreateCollaboratorForm collaborator={collaborator} cities={cities} />
          </TabsContent>
          <TabsContent value="archives" className="w-full">
            <div>
              {collaborator && (
                <Card className="max-h-[1000px] overflow-hidden">
                  <CardContent></CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreateCollaborator;
