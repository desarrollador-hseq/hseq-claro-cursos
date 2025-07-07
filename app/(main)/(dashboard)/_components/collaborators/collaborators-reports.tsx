"use client";

import {
  Certificate,
  City,
  Collaborator,
  Regional,
  TrainingCollaborator,
} from "@prisma/client";
import { Fade } from "react-awesome-reveal";
import { CollaboratorFormed } from "./collaborators-formed";
import { CollaboratorsCity } from "./collaborators-city";
import { CollaboratorsKpi } from "./collaborators-kpi";
import { useDashboard } from "@/components/providers/dashboard-provider";
import { ShowTableModal } from "../modals/show-table";
import { collaboratorColumns } from "@/app/(main)/admin/colaboradores/_components/collaborator-datatable-column";
import { CollaboratorsRegional } from "./collaborators-regional";
import { ClientTable } from "@/components/client-table";

interface CollaboratorWithFormated extends Collaborator {
  city: (City & { regional: Regional | null }) | null;
  certificates: Certificate[];
  trainingCollaborators: TrainingCollaborator[];
}

interface RegionalWithCitiesAndCollaborators extends Regional {
  cities: (City & { collaborators: Collaborator[] | null })[];
}

interface CollaboratorsReportsProps {
  collaborators: CollaboratorWithFormated[];
  threshold: number;
  regionalFull: RegionalWithCitiesAndCollaborators[] | null | undefined;
}

export const CollaboratorsReports = ({
  collaborators,
  threshold,
  regionalFull,
}: CollaboratorsReportsProps) => {
  const { date } = useDashboard();

  console.log({ date });

  const filteredCollaborators =
    !date || (date?.from === undefined && date?.to === undefined)
      ? collaborators
      : collaborators.filter((collaborator) => {
          // Filtrar por fecha de certificados emitidos
          console.log({ collaboratorcert: collaborator.certificates });
          const hasCertificateInRange = collaborator.certificates.some(
            (cert) => {
              const certDate = cert.startDate || cert.certificateDate;
              if (!certDate) return false;
              const startDate = new Date(certDate);
              return (
                (!date.from || startDate >= date.from) &&
                (!date.to || startDate <= date.to)
              );
            }
          );

          // Filtrar por fecha de entrenamientos completados
          const hasTrainingInRange = collaborator.trainingCollaborators.some(
            (tc) => {
              const completionDate = tc.completionDate;
              if (!completionDate) return false;
              const startDate = new Date(completionDate);
              return (
                (!date.from || startDate >= date.from) &&
                (!date.to || startDate <= date.to)
              );
            }
          );

          return hasCertificateInRange || hasTrainingInRange;
        });

  const filteredRegionalFull =
    !date || (date.from === undefined && date.to === undefined)
      ? regionalFull
      : regionalFull?.map((reg) => ({
          ...reg,
          cities: reg.cities.map((ct) => ({
            ...ct,
            collaborators: ct.collaborators?.filter((col) => {
              // Buscar este colaborador en la lista filtrada
              return filteredCollaborators.some(
                (filteredCol) => filteredCol.id === col.id
              );
            }),
          })),
        }));

  return (
    <div
      className="w-full flex flex-col justify-center mb-6 "
      id="collaborator"
    >
      <div className="w-full grid grid-rows-3 grid-cols-1 md:grid-rows-1 md:grid-cols-3 my-1 h-max md:my-3  place-content-center px-3 ">
        <div />
        <h2 className="text-3xl font-bold text-center">Colaboradores</h2>
        <div className="place-content-center flex justify-center md:justify-end">
          <ShowTableModal title="Colaboradores">
            <ClientTable
              columns={collaboratorColumns}
              data={filteredCollaborators}
            />
          </ShowTableModal>
        </div>
      </div>

      {/* <Separator className="mb-4 bg-primary" /> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-2 mb-3 lg:grid-rows-2 ">
        <Fade delay={200} cascade triggerOnce>
          <CollaboratorsKpi
            threshold={threshold}
            collaborators={filteredCollaborators}
          />
        </Fade>
        {/* <div>
          <PercentagePie  collaborators={filteredCollaborators} />
        </div> */}
        <Fade delay={400} cascade triggerOnce>
          <CollaboratorFormed
            threshold={threshold}
            collaborators={filteredCollaborators}
          />
        </Fade>
        <div className="lg:col-span-2">
          <Fade delay={650} cascade triggerOnce>
            <CollaboratorsRegional
              collaborators={collaborators}
              regionalsFull={filteredRegionalFull}
            />
          </Fade>
        </div>
        <div className="lg:col-span-2">
          <Fade delay={600} cascade triggerOnce>
            <CollaboratorsCity collaborators={filteredCollaborators} />
          </Fade>
        </div>
      </div>
    </div>
  );
};
