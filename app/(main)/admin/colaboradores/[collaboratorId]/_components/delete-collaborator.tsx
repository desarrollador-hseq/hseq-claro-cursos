import { useState } from "react";
import { useRouter } from "next/navigation";
import { Collaborator } from "@prisma/client";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "@/app/(main)/admin/_components/modal/delete-confirm";
import { Button } from "@/components/ui/button";

interface DeleteCollaboratorProps {
  collaborator: Collaborator;
}

export const DeleteCollaborator = ({
  collaborator,
}: DeleteCollaboratorProps) => {
  const router = useRouter();
  const [isLoading, setisLoading] = useState(false);

  const onConfirm = async () => {
    setisLoading(true);
    try {
      const { data } = await axios.delete(
        `/api/collaborators/${collaborator.id}`
      );

      toast.success("Colaborado eliminado");
      router.push("/admin/colaboradores/");
      // router.refresh()
    } catch (error) {
      toast.error("ocurrió un error al momento de eliminar el colaborador");
    } finally {
      router.refresh();
      setisLoading(false);
    }
  };

  const title = (
    <p className="font-normal inline">
      el colaborador de nombre:{" "}
      <span className="font-bold ">
        {" "}
        {collaborator.name} {collaborator.lastname}{" "}
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
