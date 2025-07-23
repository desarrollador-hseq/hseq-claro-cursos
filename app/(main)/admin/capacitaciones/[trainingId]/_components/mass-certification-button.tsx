"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { Award, Users, CheckCircle, AlertCircle, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";

interface MassCertificationButtonProps {
  trainingId: string;
  trainingCollaborators: any[];
  courseName: string;
  trainingCode: string;
  threshold: number;
  isDisabled: boolean;
}

export const MassCertificationButton = ({
  trainingId,
  trainingCollaborators,
  courseName,
  trainingCode,
  threshold,
  isDisabled,
}: MassCertificationButtonProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtrar colaboradores elegibles para certificación
  const eligibleCollaborators = trainingCollaborators.filter((tc) => {
    // Para capacitaciones CETAR, la lógica es diferente
    const isCetar = (tc as any).training?.byCetar;
    
    if (isCetar) {
      // Para CETAR: verificar que tenga certificado CETAR con URL válida
      const cetarCert = (tc as any).collaborator?.cetarCertificates?.[0];
      const hasValidCetarCert = cetarCert && cetarCert.certificateUrl && cetarCert.certificateUrl.trim() !== "";
      return hasValidCetarCert && !tc.certificateIssued;
    } else {
      // Para no-CETAR: lógica original
      // Verificar que tenga todos los documentos aprobados
      const requiredDocsCount = tc.courseLevel.requiredDocuments.length;
      const approvedDocsCount = tc.documents.filter(
        (doc: any) => doc.status === "APPROVED"
      ).length;

      // Verificar que tenga documentos válidos
      const hasValidDocs =
        requiredDocsCount === 0 || approvedDocsCount === requiredDocsCount;

      // Si no tiene documentos válidos, no es elegible
      if (!hasValidDocs) return false;

      // Verificar que tenga nota aprobatoria
      const hasPassingScore =
        tc.finalScore !== null &&
        tc.finalScore !== undefined &&
        tc.finalScore >= threshold;

      // Si no tiene nota aprobatoria, no es elegible
      if (!hasPassingScore) return false;

      // Si nunca ha sido certificado, es elegible
      if (!tc.certificateIssued) return true;

      // Si ya fue certificado, verificar si el certificado puede renovarse
      // (esto se verificará en el backend, pero por simplicidad en UI mostraremos como no elegible)
      return false;
    }
  });

  // const alreadyCertified = trainingCollaborators.filter(
  //   (tc) => tc.certificateIssued
  // ).length;
  const pendingDocuments = trainingCollaborators.filter((tc) => {
    const requiredDocsCount = tc.courseLevel.requiredDocuments.length;
    const approvedDocsCount = tc.documents.filter(
      (doc: any) => doc.status === "APPROVED"
    ).length;
    return requiredDocsCount > 0 && approvedDocsCount < requiredDocsCount;
  }).length;

  const noScore = trainingCollaborators.filter(
    (tc) => tc.finalScore === null || tc.finalScore === undefined
  ).length;

  const insufficientScore = trainingCollaborators.filter(
    (tc) =>
      tc.finalScore !== null &&
      tc.finalScore !== undefined &&
      tc.finalScore < threshold
  ).length;

  const handleMassCertification = async () => {
    // if (pendingDocuments > 0) {
    //   toast.error(
    //     `Hay ${pendingDocuments} colaboradores con documentos pendientes, por favor revise los documentos de los colaboradores`
    //   );
    //   return;
    // }
    // if (noScore > 0) {
    //   toast.error(
    //     `Hay ${noScore} colaboradores sin nota asignada, por favor califique a todos los colaboradores`
    //   );
    //   return;
    // }
    // if (insufficientScore > 0) {
    //   toast.error(
    //     `Hay ${insufficientScore} colaboradores con nota insuficiente (menor a ${threshold}%), por favor verifique las notas`
    //   );
    //   return;
    // }
    if (eligibleCollaborators.length === 0) {
      toast.error("No hay colaboradores elegibles para certificar");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(
        `/api/trainings/${trainingId}/certificates/mass-generate`,
        {
          collaboratorIds: eligibleCollaborators.map((tc) => tc.collaboratorId),
        }
      );

      console.log({response})

      const { created, skipped, errors } = response.data;

      if (created > 0) {
        toast.success(
          `¡Certificados generados exitosamente! ${created} certificados creados.`
        );
      }

      if (skipped > 0) {
        toast.info(`${skipped} colaboradores ya tenían certificados.`);
      }

      if (errors > 0) {
        toast.warning(`${errors} certificados no pudieron ser generados.`);
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error generating certificates:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error al generar certificados"
        );
      } else {
        toast.error("Error inesperado al generar certificados");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const hasBlockingIssues =
    pendingDocuments > 0 || noScore > 0 || insufficientScore > 0;
  const hasDisabled = isDisabled ||
    eligibleCollaborators.length === 0 ||
    pendingDocuments > 0 ||
    noScore > 0 ||
    insufficientScore > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full flex justify-end">
        <DialogTrigger asChild>
          <Button
            className={`self-end ${
              hasBlockingIssues
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-green-700 hover:bg-green-800"
            } text-white relative`}
            size="lg"
            // disabled={hasDisabled}
          >
            <Award className="h-5 w-5 mr-2" />
            Certificar Colaboradores
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Certificación Masiva - {trainingCode}
          </DialogTitle>
          <DialogDescription>
            Generar certificados para todos los colaboradores elegibles de 
            {courseName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto max-h-[500px]">
          {hasDisabled && (
            <div className="space-y-3 overflow-y-auto max-h-[500px]">
              {/* Resumen de estado */}

              {/* Mensaje de requisitos no cumplidos */}
              {(pendingDocuments > 0 ||
                noScore > 0 ||
                insufficientScore > 0) && (
                <Card className="border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Requisitos Pendientes para Certificación
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {pendingDocuments > 0 && (
                        <div className="flex items-center gap-2 text-amber-700">
                          <FileText className="h-4 w-4" />
                          <span>
                            <strong>{pendingDocuments}</strong> colaboradores
                            tienen documentos pendientes por subir
                          </span>
                        </div>
                      )}
                      {noScore > 0 && (
                        <div className="flex items-center gap-2 text-amber-700">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            <strong>{noScore}</strong> colaboradores no tienen
                            nota asignada
                          </span>
                        </div>
                      )}
                      {insufficientScore > 0 && (
                        <div className="flex items-center gap-2 text-amber-700">
                          <AlertCircle className="h-4 w-4" />
                          <span>
                            <strong>{insufficientScore}</strong> colaboradores
                            tienen nota inferior al mínimo requerido (
                            {threshold}%)
                          </span>
                        </div>
                      )}
                      <div className="mt-3 p-3 bg-amber-100 rounded-lg">
                        <p className="text-amber-800 font-medium">
                          💡 Para proceder con la certificación masiva, todos
                          los colaboradores deben:
                        </p>
                        <ul className="mt-2 space-y-1 text-amber-700">
                          <li>
                            • Tener todos los documentos requeridos subidos
                          </li>
                          <li>
                            • Tener una nota asignada igual o mayor a{" "}
                            {threshold}%
                          </li>
                          <li>• No tener certificados previos vigentes</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Lista de colaboradores elegibles */}
          {eligibleCollaborators.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Colaboradores Listos para Certificar (
                  {eligibleCollaborators.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {eligibleCollaborators.map((tc) => (
                    <div
                      key={tc.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-green-200 bg-white"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {tc.collaborator.name} {tc.collaborator.lastname}
                        </p>
                        <p className="text-sm text-gray-600">
                          {tc.collaborator.numDoc} • {tc.courseLevel.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-100 text-green-700"
                        >
                          {tc.finalScore}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {tc.courseLevel.hours}h
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje cuando no hay colaboradores elegibles */}
          {eligibleCollaborators.length === 0 &&
            (pendingDocuments > 0 || noScore > 0 || insufficientScore > 0) && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <p className="font-medium text-red-800 mb-2">
                      No se puede proceder con la certificación masiva
                    </p>
                    <p className="text-sm text-red-700">
                      Todos los colaboradores deben cumplir con los requisitos
                      mencionados arriba antes de poder ser certificados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Mensaje cuando simplemente no hay colaboradores */}
          {eligibleCollaborators.length === 0 &&
            pendingDocuments === 0 &&
            noScore === 0 &&
            insufficientScore === 0 && (
              <Card className="border-gray-200 bg-gray-50">
                <CardContent className="pt-4">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                    <p className="font-medium text-gray-600 mb-2">
                      No hay colaboradores elegibles
                    </p>
                    <p className="text-sm text-gray-500">
                      Todos los colaboradores ya están certificados.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Botones de acción */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>

            <div className="flex flex-col items-end gap-2">
              {(pendingDocuments > 0 || noScore > 0 || insufficientScore > 0) &&
                eligibleCollaborators.length === 0 && (
                  <p className="text-xs text-red-600">
                    Resuelve todos los requisitos pendientes para continuar
                  </p>
                )}
              <LoadingButton
                onClick={handleMassCertification}
                loading={isProcessing}
                // disabled={hasDisabled}
                disabled={eligibleCollaborators.length === 0}
                className={`${
                  eligibleCollaborators.length === 0
                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <Award className="h-4 w-4 mr-2" />
                {isProcessing
                  ? "Generando certificados..."
                  : eligibleCollaborators.length === 0
                  ? "Sin colaboradores elegibles"
                  : `Generar ${eligibleCollaborators.length} Certificados`}
              </LoadingButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
