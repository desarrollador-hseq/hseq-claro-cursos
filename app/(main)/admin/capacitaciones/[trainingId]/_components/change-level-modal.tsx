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
            Cambiar el nivel de <strong>{collaborator.collaborator.fullname}</strong> en la capacitación
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
            <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
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



          {/* Acciones */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleLevelChange}
              disabled={!selectedLevelId || loading}
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