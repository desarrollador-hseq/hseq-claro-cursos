"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  HardHat,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useEppInspections } from "@/hooks/use-epp-inspections";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios";
import TitlePage from "@/components/title-page";
import ShowEppInspectionCertificate from "@/components/certificates/show-epp-inspection-certificate";
import {
  UpdateEppCollaboratorForm,
  UpdateEppDatesInfoForm,
  UpdateEppInfo,
} from "../_components/update-epp-info";
import { EppCertificationInspection } from "@prisma/client";
import { LoadingButton } from "@/components/ui/loading-button";

interface InspectionResponse {
  answer: string;
  questionText: string;
  category: string;
}

interface EppInspectionDetail {
  id: string;
  inspectionDate: string;
  certificationDate: string;
  collaboratorName: string;
  collaboratorNumDoc: string;
  collaboratorPosition: string;
  eppType: string;
  eppSerialNumber: string;
  eppBrand: string;
  eppModel: string;
  inspectorName: string;
  isSuitable: boolean;
  status: "PENDING" | "VALIDATED" | "CANCELED";
  observations: string;
  regionalId: string;
  cityName: string;
  validatedBy?: string;
  validatedAt?: string;
  validationNotes?: string;
  inspectionSummary: {
    totalQuestions: number;
    answeredQuestions: number;
    overallStatus: string;
    responses: InspectionResponse[];
    categories?: Record<string, string>[];
  };
  createdAt: string;
  updatedAt: string;
  sessionId?: string;
  equipmentIndex?: number;
}

const EPP_TYPE_NAMES: Record<string, string> = {
  ARNES_CUERPO_COMPLETO: "ARNÉS CUERPO COMPLETO",
  ESLINGA_DOBLE_TERMINAL_EN_Y: "ESLINGA DE DOBLE TERMINAL EN Y",
  ESLINGA_POSICIONAMIENTO: "ESLINGA DE POSICIONAMIENTO",
  FRENO_ARRESTADOR_CABLE: "FRENO O ARRESTADOR DE CABLE",
  MOSQUETON: "MOSQUETÓN",
  ANCLAJE_TIPO_TIE_OFF: "ANCLAJE TIPO TIE OFF",
};

const STATUS_CONFIG = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
  },
  VALIDATED: {
    label: "Validado",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  CANCELED: {
    label: "Cancelado",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
  },
};

function EditEppInspectionPage() {
  const params = useParams();
  const router = useRouter();
  const { fetchInspection, updateInspectionStatus, loading } =
    useEppInspections();

  const [inspection, setInspection] =
    useState<EppCertificationInspection | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [newStatus, setNewStatus] = useState<
    "PENDING" | "VALIDATED" | "CANCELED"
  >("PENDING");
  const [validationNotes, setValidationNotes] = useState("");
  const [observations, setObservations] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [categoriesEvaluation, setCategoriesEvaluation] = useState<
    Record<string, string>
  >({});
  const [sessionInspections, setSessionInspections] = useState<
    EppCertificationInspection[]
  >([]);
  const [sessionLoading, setSessionLoading] = useState(false);

  const eppInspectionId = params.eppInspectionId as string;

  // Cargar detalles de la inspección
  useEffect(() => {
    const loadInspectionDetail = async () => {
      if (!eppInspectionId) return;

      setLoadingDetail(true);
      try {
        const detail = await axios.get(
          `/api/epp-certifications/${eppInspectionId}`
        );
        setInspection(detail.data);
        setNewStatus(detail.data?.status);
        setValidationNotes(detail.data?.validationNotes || "");
        setObservations(detail.data?.observations || "");

        // Inicializar categorías: cargar existentes o crear con "B" por defecto
        if (
          detail.data?.inspectionSummary?.categories &&
          detail.data.inspectionSummary.categories.length > 0
        ) {
          // Cargar categorías ya evaluadas
          const existingCategories =
            detail.data.inspectionSummary.categories.reduce(
              (acc: Record<string, string>, catObj: any) => {
                const [category, value] = Object.entries(catObj)[0];
                acc[category] = value as string;
                return acc;
              },
              {}
            );
          setCategoriesEvaluation(existingCategories);
        } else if (detail.data?.inspectionSummary?.responses) {
          // Crear categorías nuevas con valor "B" por defecto
          const categories = detail.data.inspectionSummary.responses.reduce(
            (acc: Record<string, string>, response: any) => {
              if (response.category) {
                acc[response.category] = "B"; // Valor por defecto "Bueno"
              }
              return acc;
            },
            {}
          );
          setCategoriesEvaluation(categories);
        }

        // Si la inspección tiene sessionId, cargar todas las inspecciones de la sesión
        if (detail.data?.sessionId) {
          setSessionLoading(true);
          try {
            const sessionRes = await axios.get(
              `/api/epp-inspections?sessionId=${detail.data.sessionId}&limit=100`
            );
            // Ordenar por equipmentIndex si existe
            const sessionList = (sessionRes.data.inspections || []).sort(
              (a: any, b: any) =>
                (a.equipmentIndex || 0) - (b.equipmentIndex || 0)
            );
            setSessionInspections(sessionList);
          } catch (err) {
            setSessionInspections([]);
          } finally {
            setSessionLoading(false);
          }
        } else {
          setSessionInspections([]);
        }

        console.log({ detail });
      } catch (error) {
        console.error("Error loading inspection:", error);
        toast.error("Error al cargar los detalles de la inspección");
      } finally {
        setLoadingDetail(false);
      }
    };

    loadInspectionDetail();
  }, [eppInspectionId, fetchInspection]);

  // Manejar actualización de estado
  const handleStatusUpdate = async () => {
    if (!inspection) {
      toast.warning("No hay cambios para guardar");
      return;
    }

    setUpdatingStatus(true);
    try {
      // Crear el array de categorías en el formato requerido
      const categoriesArray = Object.entries(categoriesEvaluation).map(
        ([category, value]) => ({
          [category]: value,
        })
      );

      // Llamar directamente a la API para incluir las categorías
      const response = await axios.patch(
        `/api/epp-inspections/${inspection.id}/status`,
        {
          status: newStatus,
          validationNotes: validationNotes,
          categories: categoriesArray,
          observations: observations,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.error || "Error al actualizar el estado");
      }

      // Actualizar el estado local
      setInspection((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              validationNotes: validationNotes,
              validatedAt: new Date(),
              // TODO: Obtener el usuario actual del session
              validatedBy: "Usuario Actual",
            }
          : null
      );

      toast.success(`Estado actualizado a ${STATUS_CONFIG[newStatus].label}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Función para obtener el color de la respuesta
  const getAnswerColor = (answer: string) => {
    switch (answer.toLowerCase()) {
      case "si":
      case "sí":
        return "bg-green-100 text-green-800";
      case "no":
        return "bg-red-100 text-red-800";
      case "n/a":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Agrupar respuestas por categoría
  const groupedResponses =
    (inspection?.inspectionSummary as any)?.responses?.reduce(
      (
        acc: Record<string, InspectionResponse[]>,
        response: InspectionResponse
      ) => {
        if (!acc[response.category]) {
          acc[response.category] = [];
        }
        acc[response.category].push(response);
        return acc;
      },
      {} as Record<string, InspectionResponse[]>
    ) || {};

  // Navegación entre inspecciones de la sesión
  let navPrevId: string | null = null;
  let navNextId: string | null = null;
  let navCurrentIndex: number | null = null;
  if (inspection && sessionInspections.length > 1) {
    const idx = sessionInspections.findIndex((i) => i.id === inspection.id);
    navCurrentIndex = idx;
    if (idx > 0) navPrevId = sessionInspections[idx - 1].id;
    if (idx < sessionInspections.length - 1)
      navNextId = sessionInspections[idx + 1].id;
  }

  if (loadingDetail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la inspección...</p>
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Inspección no encontrada
          </h1>
          <p className="text-gray-600 mb-4">
            No se pudo cargar la información de la inspección.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_CONFIG[inspection.status].icon;

  return (
    <div className="space-y-3 p-2">
      {/* Navegación entre inspecciones de la sesión */}
      {sessionInspections.length > 1 && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            disabled={!navPrevId || sessionLoading}
            onClick={() =>
              navPrevId &&
              router.push(`/admin/inspecciones/equipos/gestionar/${navPrevId}`)
            }
          >
            ← Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Inspección {navCurrentIndex !== null ? navCurrentIndex + 1 : "-"} de{" "}
            {sessionInspections.length}
          </span>
          <Button
            variant="outline"
            disabled={!navNextId || sessionLoading}
            onClick={() =>
              navNextId &&
              router.push(`/admin/inspecciones/equipos/gestionar/${navNextId}`)
            }
          >
            Siguiente →
          </Button>
        </div>
      )}
      <TitlePage
        title={`Gestión de Inspección EPP`}
        description={`${EPP_TYPE_NAMES[inspection.eppType]} - ${
          inspection.collaboratorName
        }`}
      >
        <Badge className={`${STATUS_CONFIG[inspection.status].color} border`}>
          <StatusIcon className="w-4 h-4 mr-1" />
          {STATUS_CONFIG[inspection.status].label}
        </Badge>
        <Badge variant="outline">ID: {inspection.id.slice(-8)}</Badge>
      </TitlePage>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Colaborador */}
        <UpdateEppCollaboratorForm inspection={inspection} />
        {/* Fechas de Inspección */}
        <UpdateEppDatesInfoForm inspection={inspection} />
        {/* Información del Equipo */}
        <div className="lg:col-span-2">
          <UpdateEppInfo inspection={inspection} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Respuestas de Inspección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Respuestas de Inspección
              </div>
              <Badge variant="outline">
                {(inspection.inspectionSummary as any)?.answeredQuestions} /{" "}
                {(inspection.inspectionSummary as any)?.totalQuestions}{" "}
                respondidas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(groupedResponses).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No hay respuestas registradas
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedResponses).map(
                  ([category, responses]: any) => (
                    <div key={category}>
                      <h3 className="font-semibold text-lg mb-3 text-gray-800">
                        {category}
                      </h3>
                      <div className="grid gap-3">
                        {responses.map(
                          (response: InspectionResponse, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <p className="text-gray-700 flex-1">
                                {response.questionText}
                              </p>
                              <Badge
                                className={getAnswerColor(response.answer)}
                              >
                                {response.answer}
                              </Badge>
                            </div>
                          )
                        )}
                      </div>
                      {Object.keys(groupedResponses).indexOf(category) <
                        Object.keys(groupedResponses).length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluación de Categorías */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gestión de Estado */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Gestión de Estado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Evaluación de Categorías
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Seleccione la evaluación para cada categoría antes de
                    cambiar el estado de la inspección.
                  </p>
                  {Object.keys(categoriesEvaluation).length > 0 ? (
                    <div className="grid gap-4">
                      {Object.entries(categoriesEvaluation).map(
                        ([category, value]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <Label className="font-medium text-gray-700 flex-1">
                              {category}
                            </Label>
                            <Select
                              value={value}
                              onValueChange={(newValue) =>
                                setCategoriesEvaluation((prev) => ({
                                  ...prev,
                                  [category]: newValue,
                                }))
                              }
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="B">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    B - Bueno
                                  </div>
                                </SelectItem>
                                <SelectItem value="M">
                                  <div className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                    M - Malo
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No hay categorías disponibles para evaluar
                    </p>
                  )}
                </CardContent>
              </Card>
              <div>
                <Label htmlFor="status">Estado de la Inspección</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value: any) => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                        Pendiente
                      </div>
                    </SelectItem>
                    <SelectItem value="VALIDATED">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Validado
                      </div>
                    </SelectItem>
                    <SelectItem value="CANCELED">
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-600" />
                        Cancelado
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observations">
                  Observaciones (Aspectos a mejorar)
                </Label>
                <Textarea
                  id="observations"
                  value={inspection.observations || ""}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Agregar observaciones sobre el equipo..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="validationNotes">Justificación</Label>
                <Textarea
                  id="validationNotes"
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Agregar comentarios sobre la validación..."
                  className="min-h-[80px]"
                />
              </div>

              {inspection.validatedBy && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-medium text-gray-600">
                    Última actualización
                  </Label>
                  <p className="font-medium">{inspection.validatedBy}</p>
                  {inspection.validatedAt && (
                    <p className="text-sm text-gray-600">
                      {format(
                        new Date(inspection.validatedAt),
                        "dd/MM/yyyy HH:mm",
                        { locale: es }
                      )}
                    </p>
                  )}
                </div>
              )}

              <LoadingButton
                onClick={handleStatusUpdate}
                className="w-full"
                loading={updatingStatus}
              >
                <Save className="w-4 h-4 mr-2" />
                {updatingStatus ? "Actualizando..." : "Actualizar Estado"}
              </LoadingButton>
            </CardContent>
          </Card>
        </div>
      </div>
      {sessionInspections.length > 1 && (
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button
            variant="outline"
            disabled={!navPrevId || sessionLoading}
            onClick={() =>
              navPrevId &&
              router.push(`/admin/inspecciones/equipos/gestionar/${navPrevId}`)
            }
          >
            ← Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Inspección {navCurrentIndex !== null ? navCurrentIndex + 1 : "-"} de{" "}
            {sessionInspections.length}
          </span>
          <Button
            variant="outline"
            disabled={!navNextId || sessionLoading}
            onClick={() =>
              navNextId &&
              router.push(`/admin/inspecciones/equipos/gestionar/${navNextId}`)
            }
          >
            Siguiente →
          </Button>
        </div>
      )}
      {inspection.status === "VALIDATED" && (
        <ShowEppInspectionCertificate eppInspectionId={eppInspectionId} />
      )}
    </div>
  );
}

export default EditEppInspectionPage;
