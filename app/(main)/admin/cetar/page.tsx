import Link from "next/link";
import { PlusCircle, School } from "lucide-react";
import { getCetars } from "@/actions/cetar.action";
import { ClientTable } from "@/components/client-table";
import TitlePage from "@/components/title-page";
import { buttonVariants } from "@/components/ui/button";
import { cetarsDataTableColumns } from "./_components/cetars-datatable-columns";

const CetarsPage = async () => {
  const cetars = await getCetars();

  return (
    <div className="container">
      <TitlePage
        icon={<School className="w-8 h-8" />}
        title="CETAR"
        description="Listado de CETAR registrados en el sistema"
      >
        <Link className={buttonVariants()} href="/admin/cetar/crear">
          <PlusCircle className="w-4 h-4 mr-2" />
          Agregar CETAR
        </Link>
      </TitlePage>
      <ClientTable columns={cetarsDataTableColumns} data={cetars} />
    </div>
  );
};

export default CetarsPage;
