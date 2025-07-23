"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Check,
  CalendarIcon,
  Save,
  FileText,
  User,
  MapPin,
  Calendar,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Tipos de EPP disponibles
const EPP_TYPES = [
  { value: "ARNES_CUERPO_COMPLETO", name: "ARNÉS CUERPO COMPLETO" },
  {
    value: "ESLINGA_DOBLE_TERMINAL_EN_Y",
    name: "ESLINGA DE DOBLE TERMINAL EN Y",
  },
  { value: "ESLINGA_POSICIONAMIENTO", name: "ESLINGA DE POSICIONAMIENTO" },
  { value: "FRENO_ARRESTADOR_CABLE", name: "FRENO O ARRESTADOR DE CABLE" },
  { value: "MOSQUETON", name: "MOSQUETÓN" },
  { value: "ANCLAJE_TIPO_TIE_OFF", name: "ANCLAJE TIPO TIE OFF" },
];

// Tipo para las preguntas desde la API
interface EppQuestion {
  id: string;
  questionCode: string;
  questionText: string;
  category: string;
  isRequired: boolean;
  displayOrder: number;
  answerType: string;
  helpText?: string;
}

interface EppEquipment {
  id: string;
  eppType: string;
  eppName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufacturingDate?: Date; // Mantener consistencia con el archivo principal
  isSuitable: boolean;
  observations: string;
  inspectionAnswers: Record<string, any>;
}

interface EppInspectionSectionProps {
  equipment: EppEquipment;
  index: number;
  onUpdate: (updates: Partial<EppEquipment>) => void;
  onRemove: () => void;
  errors: Record<string, string>;
}

export const EppInspectionSection: React.FC<EppInspectionSectionProps> = ({
  equipment,
  index,
  onUpdate,
  onRemove,
  errors,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [questions, setQuestions] = useState<EppQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Actualizar nombre del EPP cuando cambia el tipo
  useEffect(() => {
    if (equipment.eppType) {
      const eppTypeName =
        EPP_TYPES.find((type) => type.value === equipment.eppType)?.name || "";
      if (eppTypeName !== equipment.eppName) {
        onUpdate({ eppName: eppTypeName });
      }
    }
  }, [equipment.eppType, equipment.eppName, onUpdate]);

  // Cargar preguntas cuando cambie el tipo de EPP
  useEffect(() => {
    if (equipment.eppType) {
      fetchQuestionsForEppType(equipment.eppType);
    } else {
      setQuestions([]);
      setQuestionsError(null);
    }
  }, [equipment.eppType]);

  // Función para cargar preguntas desde la API
  const fetchQuestionsForEppType = async (eppType: string) => {
    setLoadingQuestions(true);
    setQuestionsError(null);

    try {
      const response = await axios.get(
        `/api/epp-questions?eppType=${encodeURIComponent(eppType)}`
      );

      if (!response.data) {
        throw new Error("Error al cargar las preguntas");
      }

      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error fetching EPP questions:", error);
      setQuestionsError(
        error instanceof Error ? error.message : "Error desconocido"
      );
      toast.error("Error al cargar las preguntas de inspección");
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // El estado apto/no apto es determinado manualmente por el usuario
  // No se calcula automáticamente basado en respuestas

  // Actualizar respuesta de pregunta
  const updateQuestionAnswer = (questionCode: string, answer: string) => {
    onUpdate({
      inspectionAnswers: {
        ...equipment.inspectionAnswers,
        [questionCode]: answer,
      },
    });
  };

  // Obtener color de estado
  const getStatusColor = () => {
    if (equipment.isSuitable) {
      return "text-green-600 bg-green-50 border-green-200";
    } else {
      return "text-red-600 bg-red-50 border-red-200";
    }
  };

  // Calcular progreso de respuestas
  const answeredQuestions = questions.filter(
    (q) => equipment.inspectionAnswers[q.questionCode]
  ).length;
  console.log({ questions });

  return (
    <Card className="border-2">
      <CardHeader
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex flex-col items-center justify-between">
          <div className="flex justify-between  gap-2 w-full">
            <div className="flex items-center gap-2 text-secondary font-normal text-lg">
              <Package className="h-5 w-5" />
              Equipo #{index + 1}
            </div>
            <span className="flex items-center gap-2">
              {/* Botón de expandir/contraer */}
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </span>
          </div>
          <div className="flex justify-between w-full items-center gap-2 my-2 text-primary font-bold">
            {equipment.eppType && (
              <span className="text-2xl">
                {equipment.eppName || equipment.eppType}
              </span>
            )}
            {/* Indicador de estado del equipo */}
            {/* <div className="flex items-center gap-1">
              <div
                className={`w-3 h-3 rounded-full ${
                  equipment.isSuitable ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm font-medium">
                {equipment.isSuitable ? "APTO" : "NO APTO"}
              </span>
            </div> */}

            {/* Indicador de completitud */}
          </div>
        </CardTitle>

        {/* Barra de progreso de completitud */}
        {equipment.eppType && questions.length > 0 && (
          <div className="mt-2">
            {equipment.eppType && (
              <div className="flex items-center gap-1">
                <Badge
                  variant={
                    answeredQuestions === questions.length
                      ? "default"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {answeredQuestions}/{questions.length} preguntas
                </Badge>
                {answeredQuestions < questions.length && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          {/* Información básica del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* <div className="md:col-span-2">
              <Label htmlFor={`eppType_${equipment.id}`}>Tipo de EPP *</Label>
              <Select
                value={equipment.eppType}
                disabled={true}
              >
                <SelectTrigger
                  className={
                    errors[`equipment_${equipment.id}_type`]
                      ? "border-red-500"
                      : "bg-gray-50"
                  }
                >
                  <SelectValue placeholder="Tipo de EPP" />
                </SelectTrigger>
                <SelectContent>
                  {EPP_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors[`equipment_${equipment.id}_type`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`equipment_${equipment.id}_type`]}
                </p>
              )}
            </div> */}

            <div>
              <Label htmlFor={`brand_${equipment.id}`}>Marca *</Label>
              <Input
                id={`brand_${equipment.id}`}
                value={equipment.brand}
                onChange={(e) => onUpdate({ brand: e.target.value })}
                placeholder="Marca del equipo"
                className={
                  errors[`equipment_${equipment.id}_brand`]
                    ? "border-red-500"
                    : ""
                }
              />
              {errors[`equipment_${equipment.id}_brand`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`equipment_${equipment.id}_brand`]}
                </p>
              )}
            </div>
            <div>
              <Label>Fecha de fabricación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      errors[`equipment_${equipment.id}_manufacturingDate`]
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {equipment.manufacturingDate
                      ? format(equipment.manufacturingDate, "dd/MM/yyyy", {
                          locale: es,
                        })
                      : "Seleccionar fecha de fabricación"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    locale={es}
                    selected={equipment.manufacturingDate}
                    onSelect={(date) =>
                      date && onUpdate({ manufacturingDate: date })
                    }
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
              {errors[`equipment_${equipment.id}_manufacturingDate`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`equipment_${equipment.id}_manufacturingDate`]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor={`model_${equipment.id}`}>Lote</Label>
              <Input
                id={`model_${equipment.id}`}
                value={equipment.model}
                onChange={(e) => onUpdate({ model: e.target.value })}
                placeholder="Modelo o número de lote"
              />
            </div>

            <div>
              <Label htmlFor={`serialNumber_${equipment.id}`}>
                Número de Serie *
              </Label>
              <Input
                id={`serialNumber_${equipment.id}`}
                value={equipment.serialNumber}
                onChange={(e) => onUpdate({ serialNumber: e.target.value })}
                placeholder="Número de serie del equipo"
                className={
                  errors[`equipment_${equipment.id}_serial`]
                    ? "border-red-500"
                    : ""
                }
              />
              {errors[`equipment_${equipment.id}_serial`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`equipment_${equipment.id}_serial`]}
                </p>
              )}
            </div>
          </div>

          {/* Preguntas de inspección */}

          <div>
            <div className="flex justify-between text-sm text-gray-600 font-semibold mb-1">
              <span>Progreso de inspección</span>
              <span className="text-primary font-bold">
                {Math.round((answeredQuestions / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  answeredQuestions === questions.length
                    ? "bg-green-500"
                    : answeredQuestions > questions.length * 0.5
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(
                    (answeredQuestions / questions.length) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            {/* Mostrar error general de preguntas */}
            {errors[`equipment_${equipment.id}_questions`] && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md mt-2">
                <p className="text-red-600 text-sm font-medium">
                  ⚠️ {errors[`equipment_${equipment.id}_questions`]}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-6 border-l-2 border-primary pl-1">
            {loadingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-gray-600">Cargando preguntas...</span>
              </div>
            ) : questionsError ? (
              <div className="flex items-center justify-center py-8 text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{questionsError}</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <span>No hay preguntas configuradas para este tipo de EPP</span>
              </div>
            ) : (
              // Agrupar preguntas por categoría
              (() => {
                const groupedQuestions = questions.reduce(
                  (groups, question) => {
                    const category = question.category || "General";
                    if (!groups[category]) {
                      groups[category] = [];
                    }
                    groups[category].push(question);
                    return groups;
                  },
                  {} as Record<string, typeof questions>
                );

                // Definir colores para cada categoría
                const categoryColors: Record<string, string> = {
                  "Componente textil": "bg-blue-50 border-blue-200",
                  "Componente metálico": "bg-gray-50 border-gray-200",
                  "Componente de funcionalidad": "bg-green-50 border-green-200",
                  "Componente de impacto": "bg-orange-50 border-orange-200",
                  General: "bg-slate-50 border-slate-200",
                };

                return Object.entries(groupedQuestions).map(
                  ([category, categoryQuestions]) => (
                    <div
                      key={category}
                      className={`rounded-lg border-2 p-4 ${
                        categoryColors[category] || categoryColors["General"]
                      }`}
                    >
                      {/* Título de la categoría */}
                      <div className="mb-4 pb-2 border-b border-current border-opacity-20">
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <span className="">{category}</span>
                          <span className="text-sm text-gray-600">
                            (
                            {
                              categoryQuestions.filter(
                                (q) =>
                                  equipment.inspectionAnswers[q.questionCode]
                              ).length
                            }
                            /{categoryQuestions.length})
                          </span>
                        </h4>
                      </div>

                      {/* Preguntas de la categoría */}
                      <div className="space-y-4">
                        {categoryQuestions.map((question) => {
                          const hasError =
                            errors[
                              `equipment_${equipment.id}_question_${question.questionCode}`
                            ];

                          return (
                            <div
                              key={question.questionCode}
                              className={`space-y-2 bg-white/60 rounded-md p-3 border ${
                                hasError
                                  ? "border-red-300 bg-red-50/50"
                                  : "border-white/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Label className="text-base font-medium text-gray-700">
                                  {question.questionText}
                                </Label>
                                <span className="text-base text-red-500">
                                  *
                                </span>
                                {question.helpText && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700"
                                  >
                                    Ayuda
                                  </Badge>
                                )}
                              </div>

                              {question.helpText && (
                                <p className="text-xs text-gray-600 italic">
                                  {question.helpText}
                                </p>
                              )}

                              {/* Mostrar error específico de la pregunta */}
                              {hasError && (
                                <p className="text-red-500 text-sm font-medium">
                                  ⚠️ {hasError}
                                </p>
                              )}

                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  {
                                    value: "Si",
                                    label: "Sí",
                                    color:
                                      "border-secondary bg-secondary/20 text-secondary",
                                  },
                                  {
                                    value: "No",
                                    label: "No",
                                    color:
                                      "border-secondary bg-secondary/20  text-secondary",
                                  },
                                  {
                                    value: "N/A",
                                    label: "N/A",
                                    color:
                                      "border-secondary bg-secondary/20  text-secondary",
                                  },
                                ].map((option) => {
                                  const isSelected =
                                    equipment.inspectionAnswers[
                                      question.questionCode
                                    ] === option.value;
                                  return (
                                    <div
                                      key={option.value}
                                      className={`
                                              flex items-center space-x-3 rounded-lg border-2 p-3 cursor-pointer 
                                              transition-all duration-200 hover:scale-[1.02] hover:shadow-sm
                                              ${
                                                isSelected
                                                  ? `${option.color} border-opacity-100 shadow-md`
                                                  : "border-gray-200 bg-white hover:bg-gray-50"
                                              }
                                            `}
                                      onClick={() =>
                                        updateQuestionAnswer(
                                          question.questionCode,
                                          option.value
                                        )
                                      }
                                    >
                                      <div
                                        className={`
                                              w-5 h-5 rounded-full border-2 flex items-center justify-center
                                              transition-all duration-200
                                              ${
                                                isSelected
                                                  ? "border-current bg-current"
                                                  : "border-gray-300"
                                              }
                                            `}
                                      >
                                        {isSelected && (
                                          <Check className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                      <Label className="cursor-pointer w-full font-medium">
                                        {option.label}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                );
              })()
            )}
          </div>

          {/* Estado del Equipo - Al final del formulario */}
          {equipment.eppType && (
            <div className="mt-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
              <Label
                htmlFor={`isSuitable_${equipment.id}`}
                className="text-lg font-semibold"
              >
                Estado Final del Equipo *
              </Label>
              <p className="text-sm text-gray-600 mb-3">
                Basándose en todas las respuestas anteriores, determine el
                estado final del equipo:
              </p>
              <Select
                value={equipment.isSuitable ? "true" : "false"}
                onValueChange={(value) =>
                  onUpdate({ isSuitable: value === "true" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700 font-medium">
                        APTO PARA USO
                      </span>
                    </div>
                  </SelectItem>
                  <SelectItem value="false">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-700 font-medium">
                        NO APTO PARA USO
                      </span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <Label htmlFor={`observations_${equipment.id}`}>
              Observaciones
            </Label>
            <Textarea
              id={`observations_${equipment.id}`}
              value={equipment.observations}
              onChange={(e) => onUpdate({ observations: e.target.value })}
              placeholder="Observaciones adicionales sobre el equipo..."
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

// Modal de resumen de inspección
interface InspectionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: any;
  isSubmitting: boolean;
}

export const InspectionSummaryModal: React.FC<InspectionSummaryModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  formData,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Resumen de Inspección EPP
          </DialogTitle>
          <DialogDescription>
            Revise los datos antes de guardar la inspección
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información del Colaborador */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Información del Colaborador
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Nombre:</span>
                <p className="text-gray-700">
                  {formData.collaboratorName} {formData.collaboratorLastName}
                </p>
              </div>
              <div>
                <span className="font-medium">Documento:</span>
                <p className="text-gray-700">
                  {formData.collaboratorTypeDoc}: {formData.collaboratorNumDoc}
                </p>
              </div>
              <div>
                <span className="font-medium">Cargo:</span>
                <p className="text-gray-700">
                  {formData.position || "No especificado"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Inspección */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Información de la Inspección
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Inspector:</span>
                <p className="text-gray-700">{formData.inspectorName}</p>
              </div>
              <div>
                <span className="font-medium">Fecha:</span>
                <p className="text-gray-700">
                  {format(formData.inspectionDate, "dd/MM/yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium">Ciudad:</span>
                <p className="text-gray-700">{formData.city}</p>
              </div>
              <div>
                <span className="font-medium">Regional:</span>
                <p className="text-gray-700">{formData.regional}</p>
              </div>
            </CardContent>
          </Card>

          {/* Equipos Inspeccionados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Equipos Inspeccionados ({formData.equipment?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.equipment?.map((equipment: any, index: number) => {
                const answeredQuestions = Object.values(
                  equipment.inspectionAnswers || {}
                ).filter((a) => a).length;
                const totalQuestions = Object.keys(
                  equipment.inspectionAnswers || {}
                ).length;

                return (
                  <div
                    key={equipment.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Equipo #{index + 1}:{" "}
                        {equipment.eppName || equipment.eppType}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            equipment.isSuitable ? "default" : "destructive"
                          }
                        >
                          {equipment.isSuitable ? "APTO" : "NO APTO"}
                        </Badge>
                        <Badge variant="outline">
                          {answeredQuestions}/{totalQuestions} preguntas
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Marca:</span>
                        <p className="text-gray-600">{equipment.brand}</p>
                      </div>
                      <div>
                        <span className="font-medium">Lote:</span>
                        <p className="text-gray-600">
                          {equipment.model || "No especificado"}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Serie:</span>
                        <p className="text-gray-600">
                          {equipment.serialNumber}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Fecha Fab.:</span>
                        <p className="text-gray-600">
                          {equipment.manufacturingDate
                            ? format(
                                equipment.manufacturingDate,
                                "dd/MM/yyyy",
                                { locale: es }
                              )
                            : "No especificada"}
                        </p>
                      </div>
                    </div>

                    {/* Resumen de respuestas por categoría */}
                    {answeredQuestions > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">
                          Respuestas por categoría:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(() => {
                            const categoryStats: Record<
                              string,
                              { total: number; answered: number }
                            > = {};

                            // Simular agrupación por categoría (necesitaríamos las preguntas aquí)
                            Object.entries(
                              equipment.inspectionAnswers || {}
                            ).forEach(([code, answer]) => {
                              // Categorizar basado en código de pregunta
                              let category = "General";
                              if (
                                code.includes("quemaduras") ||
                                code.includes("decoloracion") ||
                                code.includes("manchas")
                              ) {
                                category = "Componente textil";
                              } else if (
                                code.includes("corrosion") ||
                                code.includes("deformacion") ||
                                code.includes("argollas")
                              ) {
                                category = "Componente metálico";
                              } else if (
                                code.includes("conexion") ||
                                code.includes("seguros") ||
                                code.includes("ganchos")
                              ) {
                                category = "Componente de funcionalidad";
                              }

                              if (!categoryStats[category]) {
                                categoryStats[category] = {
                                  total: 0,
                                  answered: 0,
                                };
                              }
                              categoryStats[category].total++;
                              if (answer) categoryStats[category].answered++;
                            });

                            return Object.entries(categoryStats).map(
                              ([category, stats]) => (
                                <Badge
                                  key={category}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {category}: {stats.answered}/{stats.total}
                                </Badge>
                              )
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {equipment.observations && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-sm">
                          Observaciones:
                        </span>
                        <p className="text-gray-600 text-sm mt-1">
                          {equipment.observations}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Confirmar y Guardar
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
