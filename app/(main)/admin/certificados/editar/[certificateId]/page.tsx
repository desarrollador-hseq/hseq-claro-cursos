import TitlePage from "@/components/title-page";

import { getCertificate } from "@/actions/certificates.action";
import { CertificateInfo } from "../../../capacitaciones/[trainingId]/_components/certificate-info";
import { db } from "@/lib/db";


const CertificadosPage = async ({
  params,
}: {
  params: { certificateId: string };
}) => {
  const { certificateId } = await params;
  // const certificate = await getCertificate(certificateId);
  const certificate = await db.certificate.findUnique({
    where: {
      id: certificateId,
      active: true
    },
  });

  if (!certificate) {
    return <div>Certificado no encontrado</div>;
  }
  // console.log({ certificate });
  return (
    <div>
      <TitlePage
        title="Certificado"
        description="Editar certificado del colaborador"
      >
      
      </TitlePage>

      <div className="flex flex-col gap-4">
        <CertificateInfo
          collaboratorId={certificate?.collaboratorId || ""}
   
          certificate={certificate}
        />
      </div>
    </div>
  );
};

export default CertificadosPage;
