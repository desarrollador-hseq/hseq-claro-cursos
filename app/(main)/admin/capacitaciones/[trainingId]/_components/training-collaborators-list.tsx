"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Settings,
  ArrowUpDown,
  Trash2,
  PlusCircle,
  Award,
  Users,
  Link,
  ExternalLink,
} from "lucide-react";
import { CollaboratorDocumentsModal } from "./collaborator-documents-modal";
import { ChangeLevelModal } from "./change-level-modal";
import { DeleteCollaboratorModal } from "./delete-collaborator-modal";
import { EditScoreModal } from "./edit-score-modal";
import {
  Certificate,
  City,
  Collaborator,
  Course,
  CourseLevel,
  Regional,
  RequiredDocument,
  Training,
  TrainingCollaborator,
  TrainingCollaboratorDocument,
} from "@prisma/client";
import { SimpleModal } from "@/components/simple-modal";
import { AddCollaboratorForm } from "./add-collaborator-form";
import { CoordinatorUp } from "@/components/rbac-wrapper";
import { cn } from "@/lib/utils";
import { MassCertificationButton } from "./mass-certification-button";
import ShowCertificate from "@/components/certificates/show-certificate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalCertificateDialog } from "./external-certificate-dialog";

interface TrainingCollaboratorsListProps {
  training: trainingInterface;
  threshold: number; // Nota mínima para aprobar
  availableCollaborators: Collaborator[];
  totalCollaborators: number;
  isAdmin: boolean;
}

interface trainingInterface extends Training {
  trainingCollaborators: TrainingCollaboratorWithRelations[];
  course: Course;
}

interface TrainingCollaboratorWithRelations extends TrainingCollaborator {
  collaborator: Collaborator | null;
  courseLevel: (CourseLevel & { requiredDocuments: RequiredDocument[] }) | null;
  documents: TrainingCollaboratorDocument[] | null;
}

export const TrainingCollaboratorsList = ({
  training,
  threshold,
  availableCollaborators,
  totalCollaborators,
  isAdmin,
}: TrainingCollaboratorsListProps) => {
  const [selectedCollaborator, setSelectedCollaborator] = useState<any>(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isChangeLevelModalOpen, setIsChangeLevelModalOpen] = useState(false);
  const [collaboratorToChangeLevel, setCollaboratorToChangeLevel] =
    useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<any>(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<
    string | null
  >(null);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      REGISTERED: {
        label: "Registrado",
        variant: "secondary" as const,
        icon: Clock,
      },
      CONFIRMED: {
        label: "Confirmado",
        variant: "default" as const,
        icon: CheckCircle,
      },
      ATTENDING: {
        label: "Asistiendo",
        variant: "default" as const,
        icon: CheckCircle,
      },
      COMPLETED: {
        label: "Completado",
        variant: "default" as const,
        icon: CheckCircle,
      },
      FAILED: {
        label: "Falló",
        variant: "destructive" as const,
        icon: AlertCircle,
      },
      DROPPED: {
        label: "Abandonó",
        variant: "destructive" as const,
        icon: AlertCircle,
      },
      ABSENT: {
        label: "Ausente",
        variant: "secondary" as const,
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge
        variant={config?.variant || "outline"}
        className="flex items-center gap-1 text-xs"
      >
        <Icon className="h-3 w-3" />
        {config?.label || status}
      </Badge>
    );
  };

  const getDocumentStatus = (collaborator: any) => {
    const requiredDocsCount = collaborator.courseLevel.requiredDocuments.length;
    const submittedDocs = collaborator.documents || [];

    // Filtrar solo los documentos que corresponden a los documentos requeridos del nivel actual
    const currentLevelRequiredDocIds =
      collaborator.courseLevel.requiredDocuments.map((doc: any) => doc.id);
    const validSubmittedDocs = submittedDocs.filter((doc: any) =>
      currentLevelRequiredDocIds.includes(doc.requiredDocumentId)
    );

    const approvedDocs = validSubmittedDocs.filter(
      (doc: any) => doc.status === "APPROVED"
    );
    const pendingDocs = validSubmittedDocs.filter(
      (doc: any) => doc.status === "PENDING"
    );
    const rejectedDocs = validSubmittedDocs.filter(
      (doc: any) => doc.status === "REJECTED"
    );

    if (requiredDocsCount === 0) {
      return {
        status: "none",
        label: "Sin documentos requeridos",
        color: "gray",
      };
    }

    if (approvedDocs.length === requiredDocsCount) {
      return { status: "complete", label: "Completo", color: "green" };
    }

    if (validSubmittedDocs.length === 0) {
      return { status: "missing", label: "Sin documentos", color: "red" };
    }

    if (rejectedDocs.length > 0) {
      return {
        status: "rejected",
        label: "Documentos rechazados",
        color: "red",
      };
    }

    if (pendingDocs.length > 0) {
      return { status: "pending", label: "En revisión", color: "yellow" };
    }

    return { status: "incomplete", label: "Incompleto", color: "orange" };
  };

  const getScoreStatus = (collaborator: any) => {
    const score = collaborator.finalScore;

    if (score === null || score === undefined) {
      return { status: "no-score", label: "Sin nota", color: "gray" };
    }

    if (score >= threshold) {
      return { status: "passing", label: "Aprobado", color: "green" };
    } else {
      return { status: "failing", label: "Reprobado", color: "red" };
    }
  };

  const isDisabled =
    // training.status === "COMPLETED" ||
    training.status === "CANCELLED" || training.status === "POSTPONED";

  const isPending = (collaborator: any) => {
    const requiredDocsCount = collaborator.courseLevel.requiredDocuments.length;
    const submittedDocs = collaborator.documents || [];

    // Filtrar solo los documentos que corresponden a los documentos requeridos del nivel actual
    const currentLevelRequiredDocIds =
      collaborator.courseLevel.requiredDocuments.map((doc: any) => doc.id);
    const validSubmittedDocs = submittedDocs.filter((doc: any) =>
      currentLevelRequiredDocIds.includes(doc.requiredDocumentId)
    );

    return (
      collaborator.finalScore === null ||
      collaborator.finalScore === undefined ||
      collaborator.finalScore === 0 ||
      (requiredDocsCount > 0 && validSubmittedDocs.length < requiredDocsCount)
    );
  };

  const handleViewDocuments = (collaborator: any) => {
    setSelectedCollaborator(collaborator);
    setIsDocumentsModalOpen(true);
  };

  const handleChangeLevel = (collaborator: any) => {
    setCollaboratorToChangeLevel(collaborator);
    setIsChangeLevelModalOpen(true);
  };

  const handleDeleteCollaborator = (collaborator: any) => {
    setCollaboratorToDelete(collaborator);
    setIsDeleteModalOpen(true);
  };

  const handleViewCertificate = async (certificates: Certificate[]) => {
    try {
      if (certificates.length > 0) {
        setSelectedCertificateId(certificates[0].id);
        setIsCertificateModalOpen(true);
      } else {
        toast.error("No se encontró el certificado");
      }
    } catch (error) {
      console.error("Error buscando certificado:", error);
      toast.error("Error al buscar el certificado");
    }
  };

  console.log({ training });

  if (!training.trainingCollaborators?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Colaboradores Inscritos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2 text-gray-500">
            {/* <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No hay colaboradores inscritos</p>
            <p className="text-xs">
              Agrega colaboradores usando el panel de la derecha
            </p> */}
            <AddCollaboratorForm
              trainingId={training.id}
              course={training.course}
              availableCollaborators={availableCollaborators}
              maxCapacity={training.maxCapacity}
              currentCount={totalCollaborators}
              byCetar={training.byCetar}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between h-full">
          <div className="flex flex-col gap-2 h-full">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Colaboradores Inscritos ({training.trainingCollaborators.length})
            </CardTitle>
            {/* <TrainingResume
              trainingCollaborators={training.trainingCollaborators}
              threshold={threshold}
            /> */}
          </div>

          <div className="flex flex-col items-end gap-2 h-full">
            <SimpleModal
              title="Agregar colaborador"
              desc="Agregar un colaborador a la capacitación"
              btnDisabled={isDisabled || training.status === "COMPLETED"}
              textBtn={
                <span className="flex items-center gap-2">
                  <PlusCircle className="h-6 w-6" /> Agregar colaborador
                </span>
              }
            >
              <AddCollaboratorForm
                trainingId={training.id}
                course={training.course}
                availableCollaborators={availableCollaborators}
                maxCapacity={training.maxCapacity}
                currentCount={totalCollaborators}
                byCetar={training.byCetar}
              />
            </SimpleModal>
            {/* Botón de certificación masiva */}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {training.trainingCollaborators
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((tc: any, index: number) => {
                const docStatus = getDocumentStatus(tc);
                const scoreStatus = getScoreStatus(tc);

                console.log({ tc });

                return (
                  <div
                    key={tc.id}
                    className={cn(
                      "flex items-center justify-between p-4 border rounded-lg transition-colors",
                      isDisabled && !isAdmin
                        ? "opacity-60"
                        : !training.byCetar && isPending(tc)
                        ? "bg-red-50 border-red-200"
                        : "bg-green-50 border-green-200"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tc.collaborator.fullname}
                          </p>
                          <p className="text-sm text-gray-600">
                            {tc.collaborator.numDoc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                        {tc.collaborator.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {tc.collaborator.city.realName}
                            {tc.collaborator.city.regional &&
                              ` (${tc.collaborator.city.regional.name})`}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Nivel del curso */}
                      <div
                        className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 `}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium">
                            Nivel
                          </span>
                          <span className="text-sm font-semibold text-slate-700">
                            {tc.courseLevel.name}
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChangeLevel(tc)}
                          title="Cambiar nivel"
                          className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700"
                          disabled={
                            isAdmin ? false : isDisabled || tc.certificateIssued
                          }
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Estado de documentos */}
                      {!training.byCetar && (
                        <div
                          className={`flex items-center gap-2  border-2  rounded-lg px-3 py-2 ${
                            isDisabled && !isAdmin
                              ? "opacity-50"
                              : docStatus.color === "green"
                              ? "border-green-500 bg-green-600 text-white"
                              : docStatus.color === "yellow"
                              ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                              : docStatus.color === "orange"
                              ? "border-orange-500 text-white bg-red-500"
                              : docStatus.color === "red"
                              ? "border-red-500 text-red-700 bg-red-50"
                              : ""
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-medium">
                              Documentos
                            </span>
                            {isDisabled && !isAdmin ? (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs border-slate-300 bg-slate-50 border-none text-slate-300"
                                >
                                  Documentos
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    docStatus.color === "green"
                                      ? "border-green-500 text-green-700 bg-green-50"
                                      : docStatus.color === "yellow"
                                      ? "border-yellow-500 text-yellow-700 bg-yellow-50"
                                      : docStatus.color === "orange"
                                      ? "border-orange-500 text-orange-700 bg-orange-50"
                                      : docStatus.color === "red"
                                      ? "border-red-500 text-red-700 bg-red-50"
                                      : "border-slate-300 bg-slate-50 border-none text-slate-300"
                                  } `}
                                >
                                  {docStatus.label}
                                </Badge>
                                {tc.courseLevel.requiredDocuments.length >
                                  0 && (
                                  <span className="text-[10px] font-semibold">
                                    {tc.courseLevel.requiredDocuments.length}/{" "}
                                    {(() => {
                                      const currentLevelRequiredDocIds =
                                        tc.courseLevel.requiredDocuments.map(
                                          (doc: any) => doc.id
                                        );
                                      const validDocs = (
                                        tc.documents || []
                                      ).filter((doc: any) =>
                                        currentLevelRequiredDocIds.includes(
                                          doc.requiredDocumentId
                                        )
                                      );
                                      return validDocs.length;
                                    })()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          {tc.courseLevel.requiredDocuments.length > 0 && (
                            <Button
                              variant="outline"
                              onClick={() => handleViewDocuments(tc)}
                              title="Ver documentos"
                              className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
                              disabled={
                                isAdmin
                                  ? false
                                  : isDisabled || tc.certificateIssued
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      {!training.byCetar && (
                        <div
                          className={`flex items-center gap-2 border-2  rounded-lg px-3 py-2 ${
                            isDisabled && !isAdmin
                              ? "opacity-50"
                              : scoreStatus.status === "no-score"
                              ? "bg-red-100  border-red-400 text-slate-600"
                              : scoreStatus.status === "failing"
                              ? "bg-red-500 border-red-600 text-white"
                              : scoreStatus.status === "passing"
                              ? "bg-green-600 border-green-700 text-white"
                              : "bg-s   late-100 border-2 border-slate-400 text-slate-600"
                          } `}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs  font-medium">
                              Calificación
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  isDisabled && !isAdmin
                                    ? "opacity-50"
                                    : scoreStatus.color === "green"
                                    ? "border-green-500 text-green-700 bg-green-50"
                                    : scoreStatus.color === "red"
                                    ? "border-red-500 text-red-700 bg-red-50"
                                    : "border-slate-300 text-slate-700 bg-slate-50"
                                }`}
                              >
                                {scoreStatus.label}
                              </Badge>
                              {tc.finalScore !== null &&
                                tc.finalScore !== undefined && (
                                  <span className="text-xs font-semibold text-slate-700">
                                    {tc.finalScore}%
                                  </span>
                                )}
                            </div>
                          </div>

                          <EditScoreModal
                            collaborator={tc}
                            trainingId={training.id}
                            threshold={threshold}
                            isAdmin={isAdmin}
                            isDisabled={isDisabled}
                          />
                        </div>
                      )}
                      {/* Estado de nota */}

                      {/* Estado del colaborador */}
                      <div
                        className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 `}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 font-medium">
                            Estado
                          </span>
                          <div className="flex flex-col items-center">
                            {getStatusBadge(tc.status)}
                            <span className="text-[10px] text-slate-500">
                              {/* {new Date(tc.registrationDate).toLocaleDateString(
                                "es-ES"
                              )} */}
                            </span>
                            {tc.certificateIssued && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewCertificate(
                                    tc.collaborator.certificates
                                  )
                                }
                                title="Ver certificado"
                                className="h-6 w-auto px-2 mt-1 text-[10px] text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Award className="h-3 w-3 mr-1" />
                                Certificado
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {training.byCetar && (
                        <div
                          className={`flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 relative `}
                        >
                          <div className="flex flex-col ">
                            <span className="text-xs text-slate-500 font-medium">
                              Certificado
                            </span>
                            <div className="flex items-center gap-1 ">
                                                             <ExternalCertificateDialog
                                 trainingId={training.id}
                                 collaboratorId={tc.collaboratorId}
                                 collaboratorName={
                                   tc.collaborator?.fullname || ""
                                 }
                                 currentUrl={tc.collaborator?.cetarCertificates?.[0]?.certificateUrl || null}
                                 trigger={
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     title={
                                       tc.collaborator?.cetarCertificates?.[0]?.certificateUrl
                                         ? "Ver/Editar certificado CETAR"
                                         : "Añadir certificado CETAR"
                                     }
                                     className={cn(
                                       "flex items-center gap-2 p-0 h-fit",
                                       tc.collaborator?.cetarCertificates?.[0]?.certificateUrl
                                         ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                         : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                     )}
                                   >
                                     <FileText className="h-4 w-4" />
                                     {tc.collaborator?.cetarCertificates?.[0]?.certificateUrl ? (
                                       <span className="text-xs">
                                         Certificado
                                       </span>
                                     ) : (
                                       <span className="text-xs">
                                         Añadir URL
                                       </span>
                                     )}
                                   </Button>
                                 }
                               />
                               {tc.collaborator?.cetarCertificates?.[0]?.certificateUrl && (
                                 <a
                                   href={tc.collaborator?.cetarCertificates?.[0]?.certificateUrl}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-blue-500 absolute right-0 top-0 "
                                 >
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     title="Abrir certificado"
                                     className=" p-1 h-fit "
                                   >
                                     <ExternalLink className="h-3 w-3" />
                                   </Button>
                                 </a>
                               )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Acciones */}
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          title={
                            tc.certificateIssued
                              ? "No se puede eliminar (certificado emitido)"
                              : "Eliminar colaborador"
                          }
                          onClick={() => handleDeleteCollaborator(tc)}
                          disabled={isDisabled || tc.certificateIssued}
                          className={
                            tc.certificateIssued
                              ? "text-slate-400 cursor-not-allowed"
                              : "text-red-500 hover:text-red-700 hover:bg-red-50"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
        <CardFooter>
          {totalCollaborators > 0 && !training.byCetar && (
            <MassCertificationButton
              trainingId={training.id}
              trainingCollaborators={training.trainingCollaborators}
              courseName={training.course.name || ""}
              trainingCode={training.code || ""}
              threshold={threshold}
              isDisabled={isDisabled}
            />
          )}
        </CardFooter>
      </Card>

      {/* Modal de documentos */}
      {selectedCollaborator && (
        <CollaboratorDocumentsModal
          isOpen={isDocumentsModalOpen}
          onClose={() => {
            setIsDocumentsModalOpen(false);
            setSelectedCollaborator(null);
          }}
          trainingCollaborator={selectedCollaborator}
          trainingId={training.id}
          canManage={true}
        />
      )}

      {/* Modal de cambio de nivel */}
      <ChangeLevelModal
        collaborator={collaboratorToChangeLevel}
        training={training}
        open={isChangeLevelModalOpen}
        onOpenChange={setIsChangeLevelModalOpen}
      />

      {/* Modal de eliminar colaborador */}
      <DeleteCollaboratorModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCollaboratorToDelete(null);
        }}
        collaborator={collaboratorToDelete}
        trainingId={training.id}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          setCollaboratorToDelete(null);
        }}
      />

      {/* Modal de certificado */}
      <Dialog
        open={isCertificateModalOpen}
        onOpenChange={(open) => {
          setIsCertificateModalOpen(open);
          if (!open) {
            setSelectedCertificateId(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Certificado de Capacitación
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedCertificateId && (
              <ShowCertificate certificateId={selectedCertificateId} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
