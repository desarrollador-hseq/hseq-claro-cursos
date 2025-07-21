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
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

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
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex flex-col items-start justify-between">
          <div className="flex items-center justify-between gap-2 w-full">
            <Badge variant="outline" className="text-sm">
              Equipo #{index + 1}
            </Badge>
           <span className="flex items-center gap-2">
           <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
           </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {equipment.eppName || "Sin especificar"}
            </span>

            {/* {equipment.eppType && (
              <Badge className={getStatusColor()}>
                {equipment.isSuitable ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    APTO
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    NO APTO
                  </div>
                )}
              </Badge>
            )} */}
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {answeredQuestions}/{questions.length} preguntas
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          {/* Información básica del equipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`eppType_${equipment.id}`}>Tipo de EPP *</Label>
              <Select
                value={equipment.eppType}
                onValueChange={(value) => onUpdate({ eppType: value })}
              >
                <SelectTrigger
                  className={
                    errors[`equipment_${equipment.id}_type`]
                      ? "border-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Seleccionar tipo de EPP" />
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
            </div>

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
              <Label htmlFor={`model_${equipment.id}`}>Modelo / Lote</Label>
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
          {equipment.eppType && questions.length > 0 && (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setQuestionsOpen(!questionsOpen)}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Preguntas de Inspección ({answeredQuestions}/
                  {questions.length})
                </div>
                {questionsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {questionsOpen && (
                <div className="mt-4 space-y-4 border-l-4 border-blue-200 pl-4">
                  {loadingQuestions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-gray-600">
                        Cargando preguntas...
                      </span>
                    </div>
                  ) : questionsError ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span>{questionsError}</span>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <span>
                        No hay preguntas configuradas para este tipo de EPP
                      </span>
                    </div>
                  ) : (
                    questions.map((question) => (
                      <div key={question.questionCode} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-lg font-medium">
                            {question.questionText}
                          </Label>
                          {question.isRequired && (
                            <span className="text-base text-red-500">*</span>
                          )}
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

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              value: "Si",
                              label: "Sí",
                              color:
                                "border-primary bg-primary/10 text-primary",
                            },
                            {
                              value: "No",
                              label: "No",
                              color:
                                "border-secondary bg-secondary/10 text-secondary",
                            },
                            {
                              value: "N/A",
                              label: "N/A",
                              color: "border-gray-400 bg-gray-50 text-gray-400",
                            },
                          ].map((option, index) => {
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
                                      ? `${option.color} border-opacity-100 shadow-sm`
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
                    ))
                  )}
                </div>
              )}
            </div>
          )}

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
