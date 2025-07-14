"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Loader2,
} from "lucide-react";
import { UpdateDocumentForm } from "./update-document";
import { RequiredDocument } from "@prisma/client";

interface CollaboratorDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingCollaborator: any;
  trainingId: string;
  canManage: boolean;
}

export const CollaboratorDocumentsModal = ({
  isOpen,
  onClose,
  trainingCollaborator,
  trainingId,
  canManage,
}: CollaboratorDocumentsModalProps) => {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewingDocId, setReviewingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, trainingCollaborator, trainingCollaborator?.courseLevelId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/trainings/${trainingId}/collaborators/${trainingCollaborator.collaborator.id}/documents`
      );
      setDocuments(response.data);
    } catch (error) {
      toast.error("Error al cargar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDocument = async (documentId: string, status: string) => {
    try {
      // Encontrar el documento para obtener el requiredDocumentId
      const document = validDocuments.find((doc) => doc.id === documentId);
      if (!document) return;

      await axios.patch(
        `/api/trainings/${trainingId}/collaborators/${trainingCollaborator.collaborator.id}/documents/${document.requiredDocumentId}`,
        {
          status,
          reviewNotes: reviewNotes || null,
        }
      );

      toast.success(
        `Documento ${status === "APPROVED" ? "aprobado" : "rechazado"}`
      );
      fetchDocuments();
      setReviewingDocId(null);
      setReviewNotes("");
      router.refresh();
    } catch (error) {
      toast.error("Error al revisar documento");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { label: "Pendiente", variant: "secondary" as const },
      APPROVED: { label: "Aprobado", variant: "default" as const },
      REJECTED: { label: "Rechazado", variant: "destructive" as const },
    };

    const statusConfig = config[status as keyof typeof config];
    return (
      <Badge variant={statusConfig?.variant || "secondary"}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const requiredDocuments =
    trainingCollaborator.courseLevel.requiredDocuments || [];
  
  // Filtrar solo los documentos que corresponden al nivel actual
  const currentLevelRequiredDocIds = requiredDocuments.map((doc: RequiredDocument) => doc.id);
  const validDocuments = documents.filter((doc) => 
    currentLevelRequiredDocIds.includes(doc.requiredDocumentId)
  );
  
  const documentsMap = new Map(
    validDocuments.map((doc) => [doc.requiredDocumentId, doc])
  );

  // Calcular estadísticas usando solo documentos válidos para el nivel actual
  const approvedCount = validDocuments.filter(
    (doc) => doc.status === "APPROVED"
  ).length;
  const pendingCount = validDocuments.filter(
    (doc) => doc.status === "PENDING"
  ).length;
  const rejectedCount = validDocuments.filter(
    (doc) => doc.status === "REJECTED"
  ).length;
  const missingCount = requiredDocuments.length - validDocuments.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] min-h-[50vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Documentos de <span className="font-bold text-blue-600">{trainingCollaborator.collaborator.name} {trainingCollaborator.collaborator.lastname}</span>
          </DialogTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Nivel: {trainingCollaborator.courseLevel.name}
            </span>
            <span>•</span>
            <span>{trainingCollaborator.collaborator.numDoc}</span>
            {trainingCollaborator.collaborator.city && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {trainingCollaborator.collaborator.city.realName}
                  {trainingCollaborator.collaborator.city.regional &&
                    ` (${trainingCollaborator.collaborator.city.regional.name})`}
                </span>
              </>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 p-0">
          {/* Estadísticas */}
          {/* <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {approvedCount}
                  </p>
                  <p className="text-sm text-green-600">Aprobados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {pendingCount}
                  </p>
                  <p className="text-sm text-yellow-600">Pendientes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {rejectedCount}
                  </p>
                  <p className="text-sm text-red-600">Rechazados</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-700">
                    {missingCount}
                  </p>
                  <p className="text-sm text-gray-600">Faltantes</p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          <Separator />

          {/* Lista de documentos requeridos con UpdateDocumentForm */}
          <div className="space-y-6 p-0">
            {/* <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos Requeridos ({requiredDocuments.length})
            </h3> */}

            {!loading ? requiredDocuments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay documentos requeridos para este nivel</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {requiredDocuments.map((reqDoc: RequiredDocument) => {
                  const existingDoc = documentsMap.get(reqDoc.id);

                  return (
                    <div key={reqDoc.id} className="">
                      <Card className={`border ${existingDoc ? 'border-blue-500' : 'border-gray-200'} p-0`}>
                        <CardContent className="p-0">
                          {/* Siempre mostrar el componente de actualización de documento */}
                          <div className="space-y-4 p-0">
                            <UpdateDocumentForm
                              trainingId={trainingId}
                              trainingCollaboratorId={trainingCollaborator.collaborator.id}
                              requiredDocumentId={reqDoc.id}
                              label={reqDoc.name}
                              ubiPath="trainings/documents"
                              initialFileUrl={existingDoc?.documentLink}
                            />

                            {/* Mostrar información adicional y botones de revisión solo si existe documento */}
                            {existingDoc && (
                              <>
                                <div className="flex items-center justify-between pt-2 border-t">
                                  {/* <div className="flex items-center gap-2">
                                    {getStatusIcon(existingDoc.status)}
                                    {getStatusBadge(existingDoc.status)}
                                  </div> */}

                                  {canManage && existingDoc.status === "PENDING" && (
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleReviewDocument(
                                            existingDoc.id,
                                            "APPROVED"
                                          )
                                        }
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Aprobar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setReviewingDocId(existingDoc.id)
                                        }
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Rechazar
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {/* Modal de rechazo */}
                                {reviewingDocId === existingDoc.id && (
                                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                    <h4 className="font-medium text-red-800 mb-2">
                                      Rechazar Documento
                                    </h4>
                                    <Textarea
                                      placeholder="Motivo del rechazo..."
                                      value={reviewNotes}
                                      onChange={(e) =>
                                        setReviewNotes(e.target.value)
                                      }
                                      className="mb-3"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleReviewDocument(
                                            existingDoc.id,
                                            "REJECTED"
                                          )
                                        }
                                      >
                                        Rechazar
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setReviewingDocId(null);
                                          setReviewNotes("");
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                )}

                                {/* Mostrar notas de revisión si existen */}
                                {existingDoc.reviewNotes && (
                                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm font-medium text-yellow-800 mb-1">
                                      Notas de revisión:
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                      {existingDoc.reviewNotes}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Loader2 className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                <p>Cargando documentos...</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
