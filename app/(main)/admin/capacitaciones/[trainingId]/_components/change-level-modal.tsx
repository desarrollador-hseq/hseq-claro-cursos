"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpDown,
  AlertCircle,
} from "lucide-react";

interface ChangeLevelModalProps {
  collaborator: any;
  training: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChangeLevelModal = ({
  collaborator,
  training,
  open,
  onOpenChange
}: ChangeLevelModalProps) => {
  const router = useRouter();
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificateWarning, setCertificateWarning] = useState<string>("");

  // Verificar si el colaborador ya tiene certificados del nuevo nivel seleccionado
  const checkExistingCertificates = async (courseLevelId: string) => {
    if (!courseLevelId || !collaborator) {
      setCertificateWarning("");
      return;
    }

    try {
      // Verificar certificado regular
      const certificateResponse = await axios.get(
        `/api/certificates/find?collaboratorId=${collaborator.collaborator.id}&courseLevelId=${courseLevelId}`
      );

      if (certificateResponse.data) {
        const certificate = certificateResponse.data;
        const level = training.course.courseLevels.find(
          (l: any) => l.id === courseLevelId
        );

        if (certificate.type === "cetar") {
          setCertificateWarning(
            `Este colaborador ya tiene certificado CETAR del curso "${training.course.name}" - Nivel "${level?.name}"`
          );
        } else {
          // Verificar si el certificado aún es válido
          if (certificate.dueDate) {
            const dueDate = new Date(certificate.dueDate);
            if (dueDate > new Date()) {
              setCertificateWarning(
                `Este colaborador ya tiene certificado válido del curso "${training.course.name}" - Nivel "${level?.name}" que vence el ${dueDate.toLocaleDateString()}`
              );
            } else {
              setCertificateWarning("");
            }
          } else {
            // Certificado sin vencimiento
            setCertificateWarning(
              `Este colaborador ya tiene certificado válido del curso "${training.course.name}" - Nivel "${level?.name}". Este certificado no vence.`
            );
          }
        }
      } else {
        setCertificateWarning("");
      }
    } catch (error) {
      // Si no se encuentra certificado (404), no hay problema
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setCertificateWarning("");
      }
    }
  };

  const handleLevelChange = async () => {
    if (!selectedLevelId) {
      toast.error("Selecciona un nivel");
      return;
    }

    try {
      setLoading(true);
      
      await axios.patch(
        `/api/trainings/${training.id}/collaborators/${collaborator.collaborator.id}/change-level`,
        { courseLevelId: selectedLevelId }
      );

      toast.success("Nivel cambiado exitosamente");
      router.refresh();
      onOpenChange(false);
      setSelectedLevelId("");
      setCertificateWarning("");
    } catch (error) {
      console.error("Error changing level:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Error al cambiar el nivel");
      } else {
        toast.error("Error inesperado al cambiar el nivel");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!collaborator) return null;

  const availableLevels = training.course.courseLevels.filter(
    (level: any) => level.id !== collaborator.courseLevelId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Cambiar Nivel de Colaborador
          </DialogTitle>
          <DialogDescription>
            Cambiar el nivel de <strong>{collaborator.collaborator.name} {collaborator.collaborator.lastname}</strong> en la capacitación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nivel actual */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-sm">Nivel Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{collaborator.courseLevel.name}</p>
                  <p className="text-sm text-gray-600">
                    {collaborator.courseLevel.hours} horas • {collaborator.courseLevel.requiredDocuments.length} documentos requeridos
                  </p>
                </div>
                <Badge variant="outline">
                  {collaborator.documents?.length || 0} docs subidos
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Seleccionar nuevo nivel */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Nuevo Nivel</label>
            <Select 
              value={selectedLevelId} 
              onValueChange={(value) => {
                setSelectedLevelId(value);
                checkExistingCertificates(value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el nuevo nivel" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map((level: any) => (
                  <SelectItem key={level.id} value={level.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.name}</span>
                      <span className="text-sm text-gray-500">
                        {level.hours} horas • {level.requiredDocuments.length} documentos requeridos
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Advertencia de certificados existentes */}
          {certificateWarning && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-800 block">Certificado Existente</span>
                  <p className="text-sm text-amber-700">{certificateWarning}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    El sistema no permitirá cambiar a este nivel si el colaborador ya tiene un certificado válido.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedLevelId("");
                setCertificateWarning("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLevelChange}
              disabled={!selectedLevelId || loading || !!certificateWarning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Cambiando..." : "Cambiar Nivel"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 