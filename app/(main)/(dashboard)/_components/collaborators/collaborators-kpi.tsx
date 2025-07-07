import {
  Collaborator,
  Certificate,
  TrainingCollaborator,
} from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CollaboratorsReportsProps {
  collaborators: (Collaborator & {
    certificates: Certificate[];
    trainingCollaborators: TrainingCollaborator[];
  })[];
  threshold: number;
}

export const CollaboratorsKpi = ({
  collaborators,
  threshold,
}: CollaboratorsReportsProps) => {
  const certificatesIssued = collaborators.filter((col) =>
    col.certificates.length > 0 ||
    col.trainingCollaborators.some((tc) => tc.certificateIssued === true)
  );
  
  // Solo colaboradores activos para el conteo total
  const activeCollaborators = collaborators.filter(col => col.active === true);

  const countFormedCollaborators = () => {
    return activeCollaborators.reduce((count, collaborator) => {
      // Cuenta si el colaborador tiene al menos un certificado activo
      // O si tiene al menos un training completado con certificado emitido
      if (
        collaborator.certificates.length > 0 ||
        collaborator.trainingCollaborators.length > 0
      ) {
        return count + 1;
      }
      return count;
    }, 0);
  };
  const formedCount = countFormedCollaborators();
  let PercentageFormed;

  // Solo colaboradores activos para certificados descargados
  const checkedCertificates = activeCollaborators.filter(
    (col) => col.certificates.length > 0
  );

  if (activeCollaborators.length > 0) {
    PercentageFormed = (formedCount / activeCollaborators.length) * 100;
  } else {
    PercentageFormed = 0;
  }

  return (
    <>
      <Card className="h-full ">
        {/* <CardHeader></CardHeader> */}
        <CardContent className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-5 p-8">
          {/* =============== 1 =============== */}
                      <Card
              className={` h-full ${
                activeCollaborators.length > 0 ? "bg-secondary" : "bg-zinc-400"
              } rounded-lg text-white`}
            >
              <CardHeader className="flex justify-center font-semibold ">
                <h4 className="text-center">Total colaboradores</h4>
              </CardHeader>
              <CardContent className="flex justify-center">
                <p className="text-4xl font-bold">{activeCollaborators.length}</p>
              </CardContent>
            </Card>
          {/* =============== 2 =============== */}
                      <Card
              className={` h-full ${
                activeCollaborators.length > 0 ? "bg-secondary" : "bg-zinc-400"
              } rounded-lg text-white`}
            >
              <CardHeader className="flex justify-center font-semibold ">
                <h4 className="text-center">Total colaboradores formados</h4>
              </CardHeader>
              <CardContent className="flex justify-center">
                <p className="text-4xl font-bold">{formedCount}</p>
              </CardContent>
            </Card>
            {/* =============== 3 =============== */}
            <Card
              className={` h-full  ${
                activeCollaborators.length > 0 ? "bg-secondary" : "bg-zinc-400"
              } rounded-lg text-white`}
            >
              <CardHeader className="flex justify-center font-semibold ">
                <h4 className="text-center">Porcentaje de formación</h4>
              </CardHeader>
              <CardContent className="flex justify-center">
                <p className="text-4xl font-bold">
                  {PercentageFormed.toFixed(0)}%
                </p>
              </CardContent>
            </Card>
            {/* =============== 3 =============== */}
            <Card
              className={` h-full  ${
                activeCollaborators.length > 0 ? "bg-secondary" : "bg-zinc-400"
              } rounded-lg text-white`}
            >
              <CardHeader className="flex justify-center font-semibold ">
                <h4 className="text-center">Certificados descargados</h4>
              </CardHeader>
              <CardContent className="flex justify-center">
                <p className="text-4xl font-bold">{checkedCertificates.length}</p>
              </CardContent>
            </Card>
            <Card
              className={` h-full  ${
                collaborators.length > 0 ? "bg-secondary" : "bg-zinc-400"
              } rounded-lg text-white`}
            >
            <CardHeader className="flex justify-center font-semibold ">
              <h4 className="text-center">Certificados emitidos</h4>
            </CardHeader>
            <CardContent className="flex justify-center">
              <p className="text-4xl font-bold">{certificatesIssued.length}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </>
  );
};
