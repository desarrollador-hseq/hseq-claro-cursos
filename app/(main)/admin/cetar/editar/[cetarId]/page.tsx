import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Book, School } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { AdminOnly } from "@/components/rbac-wrapper";
import TitlePage from "@/components/title-page";
import { Separator } from "@/components/ui/separator";
import { AddCetarForm } from "../../_components/add-cetar-form";
import { getCities } from "@/actions/parameters";
import { getCetarById } from "@/actions/cetar.action";

const EditCetarPage = async ({ params }: { params: { cetarId: string } }) => {
  const { cetarId } = await params;
  const session = await getServerSession(authOptions);
  const cetar = await getCetarById(cetarId);
  const cities = await getCities();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  if (!cetar) {
    return <div>CETAR no encontrado</div>;
  }

  return (
    <AdminOnly>
      <div className="container space-y-3">
        <TitlePage
          icon={<School className="w-8 h-8" />}
          title="Editar CETAR"
          description=""
        />

        <AddCetarForm cetar={cetar} cities={cities} />
        <Separator className="my-5 bg-slate-400" />
        
      </div>
    </AdminOnly>
  );
};

export default EditCetarPage;
