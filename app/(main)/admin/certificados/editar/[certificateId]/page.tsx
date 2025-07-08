import TitlePage from "@/components/title-page";

import { getCertificate, getCertificates } from "@/actions/certificates.action";
import { CertificateInfo } from "../../../capacitaciones/[trainingId]/_components/certificate-info";
import { AdminOnly } from "@/components/rbac-wrapper";
import { EditCertificateModal } from "../../../capacitaciones/[trainingId]/_components/edit-certificate-modal";

const CertificadosPage = async ({
  params,
}: {
  params: { certificateId: string };
}) => {
  const { certificateId } = await params;
  const certificate = await getCertificate(certificateId);
  console.log({ certificate });
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
          courseLevelId={certificate?.courseLevelId || ""}
          collaboratorName={certificate?.collaboratorFullname || ""}
          courseName={certificate?.courseName || ""}
          canManage={true}
        />
      </div>
    </div>
  );
};

export default CertificadosPage;
