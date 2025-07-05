
import { DeleteConfirm } from "@/app/(main)/admin/_components/modal/delete-confirm";
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils";
import { Report } from "@prisma/client";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteReportProps {
  report: Report;
}

export const DeleteReport = ({
  report,
}: DeleteReportProps) => {
    const router = useRouter()
    const [isLoading, setisLoading] = useState(false);

  const onConfirm = async () => {
    setisLoading(true);
    try {
         await axios.delete(`/api/reports/${report.id}`)
        toast.success("Informe eliminado")
        router.push("/admin/informes/")
        // router.refresh()
    } catch (error) {
        toast.error("ocurrió un error al momento de eliminar el informe")
    } finally {
        router.refresh()
        setisLoading(false);
    }
  };

  const title =  <p className="font-normal inline">el informe con fecha:  <span className="font-bold "> {formatDate(report.deliveryDate).toString()} </span></p>;
  
  return (
    <div>
      <DeleteConfirm onConfirm={onConfirm} title={title}>
        <Button disabled={isLoading} variant="destructive" className="bg-red-700">
          <Trash2 className="w-5 h-5" />
        </Button>
      </DeleteConfirm>
    </div>
  );
};
