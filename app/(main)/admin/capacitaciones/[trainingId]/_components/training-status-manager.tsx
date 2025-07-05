"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";

interface TrainingStatusManagerProps {
  training: {
    id: string;
    status: string;
    startDate: Date;
    trainingCollaborators: Array<{
      certificateIssued: boolean;
    }>;
  };
}

export const TrainingStatusManager = ({
  training,
}: TrainingStatusManagerProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<{
    status: string;
    label: string;
    description: string;
    icon: any;
    variant: "default" | "destructive" | "secondary";
    requiresConfirmation: boolean;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const hasCertificates = training.trainingCollaborators.some(
    (tc) => tc.certificateIssued
  );
  const isStartDatePassed = new Date(training.startDate) <= new Date();

  const statusActions = {
    PLANNED: [
    //   {
    //     status: "ACTIVE",
    //     label: "Iniciar Capacitación",
    //     description: "Marcar la capacitación como activa/en curso",
    //     icon: Play,
    //     variant: "default" as const,
    //     requiresConfirmation: false,
    //     disabled: !isStartDatePassed,
    //     disabledReason: "No se puede iniciar antes de la fecha programada",
    //   },
    //   {
    //     status: "POSTPONED",
    //     label: "Posponer",
    //     description: "Posponer la capacitación para una fecha posterior",
    //     icon: Calendar,
    //     variant: "secondary" as const,
    //     requiresConfirmation: true,
    //     disabled: false,
    //   },
      {
        status: "CANCELLED",
        label: "Cancelar",
        description: "Cancelar definitivamente la capacitación",
        icon: XCircle,
        variant: "destructive" as const,
        requiresConfirmation: true,
        disabled: hasCertificates,
        disabledReason: "No se puede cancelar con certificados emitidos",
      },
      {
        status: "COMPLETED",
        label: "Completar",
        description: "Marcar la capacitación como completada",
        icon: CheckCircle,
        variant: "default" as const,
        requiresConfirmation: false,
        disabled: false,
      },
    
    ],
    ACTIVE: [
    //   {
    //     status: "COMPLETED",
    //     label: "Completar",
    //     description: "Marcar la capacitación como completada",
    //     icon: CheckCircle,
    //     variant: "default" as const,
    //     requiresConfirmation: true,
    //     disabled: false,
    //   },
    //   {
    //     status: "CANCELLED",
    //     label: "Cancelar",
    //     description: "Cancelar la capacitación",
    //     icon: XCircle,
    //     variant: "destructive" as const,
    //     requiresConfirmation: true,
    //     disabled: hasCertificates,
    //     disabledReason: "No se puede cancelar con certificados emitidos",
    //   },
    ],
    POSTPONED: [
    //   {
    //     status: "PLANNED",
    //     label: "Reactivar",
    //     description: "Volver al estado planificado",
    //     icon: Clock,
    //     variant: "secondary" as const,
    //     requiresConfirmation: false,
    //     disabled: false,
    //   },
    //   {
    //     status: "CANCELLED",
    //     label: "Cancelar",
    //     description: "Cancelar definitivamente la capacitación",
    //     icon: XCircle,
    //     variant: "destructive" as const,
    //     requiresConfirmation: true,
    //     disabled: hasCertificates,
    //     disabledReason: "No se puede cancelar con certificados emitidos",
    //   },
    ],
    COMPLETED: [],
    CANCELLED: [],
  };

  const currentActions =
    statusActions[training.status as keyof typeof statusActions] || [];

  const handleActionSelect = (action: any) => {
    if (action.disabled) {
      toast.error(action.disabledReason || "Acción no disponible");
      return;
    }

    setSelectedAction(action);

    if (action.requiresConfirmation) {
      setIsModalOpen(true);
    } else {
      handleStatusUpdate(action.status, "");
    }
  };

  const handleStatusUpdate = async (status: string, reasonText: string) => {
    setIsUpdating(true);

    try {
      await axios.patch(`/api/trainings/${training.id}/status`, {
        status,
        statusChangeReason: reasonText,
      });

      toast.success(
        `Capacitación ${getStatusLabel(status).toLowerCase()} exitosamente`
      );
      setIsModalOpen(false);
      setSelectedAction(null);
      setReason("");
      router.refresh();
    } catch (error) {
      console.error("Error updating training status:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Error al actualizar el estado");
      } else {
        toast.error("Error inesperado al actualizar el estado");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PLANNED: "planificada",
      ACTIVE: "iniciada",
      COMPLETED: "completada",
      CANCELLED: "cancelada",
      POSTPONED: "pospuesta",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (currentActions.length === 0) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Gestionar Estado
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-3 py-2 text-sm font-medium text-gray-700">
            Estado actual:{" "}
            <Badge variant="outline">{getStatusLabel(training.status)}</Badge>
          </div>
          <DropdownMenuSeparator />

          {currentActions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenuItem
                key={action.status}
                onClick={() => handleActionSelect(action)}
                disabled={action.disabled}
                className={`flex items-center gap-2 ${
                  action.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{action.label}</span>
                  <span className="text-xs text-gray-500">
                    {action.description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAction && <selectedAction.icon className="h-5 w-5" />}
              Confirmar Acción
            </DialogTitle>
            <DialogDescription>{selectedAction?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedAction?.variant === "destructive" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">¡Atención!</p>
                  <p className="text-sm text-red-700">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">
                Motivo{" "}
                {selectedAction?.variant === "destructive"
                  ? "(requerido)"
                  : "(opcional)"}
              </Label>
              <Textarea
                id="reason"
                placeholder="Ingresa el motivo de esta acción..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="bg-gray-50 p-3 rounded text-sm text-gray-600">
              <strong>Estado actual:</strong> {getStatusLabel(training.status)}{" "}
              → <strong>Nuevo estado:</strong>{" "}
              {selectedAction && getStatusLabel(selectedAction.status)}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedAction(null);
                setReason("");
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <LoadingButton
              onClick={() =>
                selectedAction &&
                handleStatusUpdate(selectedAction.status, reason)
              }
              loading={isUpdating}
              disabled={
                selectedAction?.variant === "destructive" && !reason.trim()
              }
            >
              {selectedAction?.label}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
