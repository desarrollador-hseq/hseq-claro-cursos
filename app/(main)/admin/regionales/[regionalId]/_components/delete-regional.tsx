import { DeleteConfirm } from "@/app/(main)/admin/_components/modal/delete-confirm";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { City, Inspection, Regional } from "@prisma/client";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";



interface  DeleteCityProps {
  regional: Regional;
}

export const DeleteRegional = ({ regional }:  DeleteCityProps) => {
  const router = useRouter();
  const [isLoading, setisLoading] = useState(false);

  const onConfirm = async () => {
    setisLoading(true);
    try {
      await axios.delete(`/api/regional/${regional.id}`);
      toast.success("Ciudad eliminada");
      router.push("/admin/ciudades/");
      // router.refresh()
    } catch (error) {
      toast.error("ocurrió un error al momento de eliminar la ciudad");
    } finally {
      router.refresh();
      setisLoading(false);
    }
  };

  const title = (
    <p className="font-normal inline">
      la regional de nombre:{" "}
      <span className="font-bold ">
        {regional?.name}
      </span>
    </p>
  );

  return (
    <div>
      <DeleteConfirm onConfirm={onConfirm} title={title}>
        <Button
          disabled={isLoading}
          variant="destructive"
          className="bg-red-700"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </DeleteConfirm>
    </div>
  );
};
