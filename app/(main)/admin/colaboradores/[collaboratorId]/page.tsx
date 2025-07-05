import React from "react";
import { db } from "@/lib/db";
import { Info, LockKeyhole, User } from "lucide-react";
import { AddCollaboratorForm } from "./_components/add-collaborator-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUploadForm } from "@/components/file-upload-form";
import { Card, CardContent } from "@/components/ui/card";
import { TooltipInfo } from "@/components/tooltip-info";
import { ArchivesLinkForm } from "./_components/archives-link-form";
import { GenerateCertificate } from "./_components/generate-certificate";
import { GenerateCertificateBolivar } from "./_components/generate-certificate-bolivar";
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
            <AddCollaboratorForm collaborator={collaborator} cities={cities} />
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
