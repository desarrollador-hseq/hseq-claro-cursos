"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, AlertTriangle, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/ui/loading-button";

interface DeleteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: any;
  trainingId: string;
  onSuccess?: () => void;
}

export const DeleteCollaboratorModal = ({
  isOpen,
  onClose,
  collaborator,
  trainingId,
  onSuccess,
}: DeleteCollaboratorModalProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!collaborator) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `/api/trainings/${trainingId}/collaborators/${collaborator.collaboratorId}`
      );
      
      toast.success("Colaborador eliminado exitosamente de la capacitación");
      onClose();
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al eliminar colaborador");
      } else {
        toast.error("Error inesperado al eliminar colaborador");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = !collaborator.certificateIssued;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Eliminar Colaborador
          </DialogTitle>
          <DialogDescription>
            Esta acción eliminará al colaborador de la capacitación y todos sus documentos asociados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del colaborador */}
          <Card className="border-red-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 font-semibold">
                  {collaborator.collaborator.name.charAt(0).toUpperCase()}
                  {collaborator.collaborator.lastname.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {collaborator.collaborator.name} {collaborator.collaborator.lastname}
                  </p>
                  <p className="text-sm text-gray-600">
                    {collaborator.collaborator.numDoc} • {collaborator.collaborator.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {collaborator.courseLevel.name}
                    </Badge>
                    {collaborator.certificateIssued && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                        Certificado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advertencias */}
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">
                    ¡Acción irreversible!
                  </p>
                  <p className="text-sm text-red-700">
                    Se eliminarán todos los documentos subidos por este colaborador para esta capacitación.
                  </p>
                </div>
              </div>
            </div>

            {!canDelete && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      No se puede eliminar
                    </p>
                    <p className="text-sm text-yellow-700">
                      Este colaborador ya tiene un certificado emitido. No se puede eliminar de la capacitación.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {canDelete && collaborator.documents?.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">
                      Documentos a eliminar
                    </p>
                    <p className="text-sm text-blue-700">
                      Se eliminarán {collaborator.documents.length} documento(s) subido(s) por este colaborador.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirmación de texto */}
          {canDelete && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                ¿Estás seguro de que quieres eliminar a{" "}
                <span className="font-medium">{collaborator.collaborator.name} {collaborator.collaborator.lastname}</span>{" "}
                de esta capacitación?
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose} disabled={isDeleting}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {canDelete ? (
              <LoadingButton
                onClick={handleDelete}
                loading={isDeleting}
                variant="destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Colaborador
              </LoadingButton>
            ) : (
              <Button variant="outline" disabled>
                No se puede eliminar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 