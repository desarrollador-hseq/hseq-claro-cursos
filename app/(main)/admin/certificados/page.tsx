import { ClientTable } from "@/components/client-table";
import TitlePage from "@/components/title-page";
import { certificateDatatableColumn } from "./_components/certificate-datatable-column";
import { getCertificates } from "@/actions/certificates.action";


const CertificadosPage = async () => {

    const certificates = await getCertificates();
    console.log(certificates);
  return (
    <div>
        <TitlePage title="Certificados" description="Listado de certificados" />

        <div className="flex flex-col gap-4"> 
        <ClientTable
          columns={certificateDatatableColumn}
          data={certificates}
        />
        </div>

    </div>
  );
};

export default CertificadosPage;