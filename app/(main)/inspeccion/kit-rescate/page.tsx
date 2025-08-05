"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import LogoClaro from "@/public/logo-claro.png";
import LogoGrupoHseq from "@/public/logo-grupohseq.png";
import Image from "next/image";
import {
  CalendarIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  FileText,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EppInspectionSection } from "../_components/epp-inspection-section";
import { InspectionSummaryModal } from "../_components/epp-inspection-section";
import { EppSelection } from "../_components/epp-selection";
import TitlePage from "@/components/title-page";
import axios from "axios";
import {
  FaCalendarCheck,
  FaFileLines,
  FaShieldCat,
  FaUser,
} from "react-icons/fa6";
import { Banner } from "@/components/ui/banner";

// Tipos de EPP de kit de rescate disponibles
const KIT_RESCATE_TYPES = [
  { value: "ARNES_RESCATE", name: "ARNÉS DE RESCATE" },
  { value: "POLIPASTO_RESCATE", name: "POLIPASTO DE RESCATE" },
  { value: "MOSQUETON_RESCATE", name: "MOSQUETONES DE RESCATE" },
  { value: "ANCLAJE_PORTATIL_RESCATE", name: "ANCLAJE PORTÁTIL DE RESCATE" },
  { value: "BLOQUEADORES_RESCATE", name: "BLOQUEADORES DE RESCATE" },
];

interface EppEquipment {
  id: string;
  eppType: string;
  eppName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufacturingDate?: Date;
  isSuitable: boolean;
  observations: string;
  inspectionAnswers: Record<string, any>;
}

interface InspectionForm {
  // Información del colaborador
  collaboratorName: string;
  collaboratorLastName: string;
  collaboratorNumDoc: string;
  collaboratorTypeDoc: string;

  // Información de la inspección
  inspectorName: string;
  inspectionDate: Date;
  city: string;
  regional: string;
  position: string;

  // Equipos EPP (hasta 6)
  equipment: EppEquipment[];
}

// ID de sesión de inspección para agrupar inspecciones relacionadas
interface InspectionSession {
  sessionId: string;
  createdAt: Date;
  totalInspections: number;
  completedInspections: number;
}

export default function KitRescateInspectionPage() {
  const [selectedEppTypes, setSelectedEppTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState<InspectionForm>({
    collaboratorName: "",
    collaboratorLastName: "",
    collaboratorNumDoc: "",
    collaboratorTypeDoc: "CC",
    inspectorName: "",
    inspectionDate: new Date(),
    city: "",
    regional: "",
    position: "",
    equipment: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [regionals, setRegionals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Generar ID de sesión único
  const sessionId = React.useMemo(() => {
    return `kit_rescate_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }, []);

  // Cargar regionales al montar el componente
  useEffect(() => {
    fetchRegionals();
  }, []);

  // Sincronizar tipos seleccionados con equipos existentes
  useEffect(() => {
    const existingTypes = formData.equipment
      .map((eq) => eq.eppType)
      .filter(Boolean);
    if (existingTypes.length > 0 && selectedEppTypes.length === 0) {
      setSelectedEppTypes(existingTypes);
    }
  }, [formData.equipment, selectedEppTypes.length]);

  const fetchRegionals = async () => {
    try {
      const response = await axios.get("/api/regional");
      if (response.data && response.data.regionals) {
        setRegionals(response.data.regionals.map((r: any) => r.name));
      }
    } catch (error) {
      console.error("Error fetching regionals:", error);
      toast.error("Error al cargar las regionales");
    }
  };

  const handleEppTypeSelection = (selectedTypes: string[]) => {
    setSelectedEppTypes(selectedTypes);

    // Sincronizar equipos con la selección
    const currentEquipmentTypes = formData.equipment.map((eq) => eq.eppType);

    // Agregar equipos para tipos seleccionados que no existen
    const newEquipment: EppEquipment[] = selectedTypes
      .filter((type) => !currentEquipmentTypes.includes(type))
      .map((type) => ({
        id: `equipment_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        eppType: type,
        eppName:
          KIT_RESCATE_TYPES.find((epp) => epp.value === type)?.name || type,
        brand: "",
        model: "",
        serialNumber: "",
        manufacturingDate: undefined,
        isSuitable: true,
        observations: "",
        inspectionAnswers: {},
      }));

    // Remover equipos que ya no están seleccionados
    const filteredEquipment = formData.equipment.filter((eq) =>
      selectedTypes.includes(eq.eppType)
    );

    setFormData((prev) => ({
      ...prev,
      equipment: [...filteredEquipment, ...newEquipment],
    }));
  };

  const addEquipment = () => {
    if (formData.equipment.length >= 6) {
      toast.error("Máximo 6 equipos por inspección");
      return;
    }

    const newEquipment: EppEquipment = {
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      eppType: "",
      eppName: "",
      brand: "",
      model: "",
      serialNumber: "",
      isSuitable: true,
      observations: "",
      inspectionAnswers: {},
    };

    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, newEquipment],
    }));
  };

  const removeEquipment = (equipmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((eq) => eq.id !== equipmentId),
    }));
  };

  const updateEquipment = (
    equipmentId: string,
    updates: Partial<EppEquipment>
  ) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.map((eq) =>
        eq.id === equipmentId ? { ...eq, ...updates } : eq
      ),
    }));
  };

  // Validar formulario
  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validar información del colaborador
    if (!formData.collaboratorName.trim()) {
      newErrors.collaboratorName = "Nombre es requerido";
    }
    if (!formData.collaboratorLastName.trim()) {
      newErrors.collaboratorLastName = "Apellido es requerido";
    }
    if (!formData.collaboratorNumDoc.trim()) {
      newErrors.collaboratorNumDoc = "Número de documento es requerido";
    }
    if (!formData.inspectorName.trim()) {
      newErrors.inspectorName = "Nombre del inspector es requerido";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Ciudad es requerida";
    }
    if (!formData.regional.trim()) {
      newErrors.regional = "Regional es requerida";
    }

    // Validar que haya al menos un equipo
    if (formData.equipment.length === 0) {
      newErrors.equipment = "Debe agregar al menos un equipo";
    }

    // Validar cada equipo
    for (const eq of formData.equipment) {
      if (!eq.eppType) {
        newErrors[`equipment_${eq.id}_type`] = "Tipo de EPP es requerido";
      }
      if (!eq.brand.trim()) {
        newErrors[`equipment_${eq.id}_brand`] = "Marca es requerida";
      }
      if (!eq.serialNumber.trim()) {
        newErrors[`equipment_${eq.id}_serial`] = "Número de serie es requerido";
      }

      // Validar que todas las preguntas de inspección estén respondidas
      if (eq.eppType) {
        try {
          // Obtener preguntas reales desde la API
          const response = await axios.get(
            `/api/epp-questions?eppType=${encodeURIComponent(eq.eppType)}`
          );
          const questions = response.data.questions || [];

          if (questions.length === 0) {
            newErrors[`equipment_${eq.id}_questions`] =
              "No se pudieron cargar las preguntas para este tipo de EPP";
            continue;
          }

          const answeredQuestions = questions.filter(
            (q: any) =>
              eq.inspectionAnswers?.[q.questionCode] &&
              eq.inspectionAnswers[q.questionCode].trim() !== ""
          );

          if (answeredQuestions.length < questions.length) {
            newErrors[
              `equipment_${eq.id}_questions`
            ] = `Debe responder todas las preguntas de inspección (${answeredQuestions.length}/${questions.length})`;
          }

          // Validar cada pregunta individual
          questions.forEach((question: any) => {
            if (
              !eq.inspectionAnswers?.[question.questionCode] ||
              eq.inspectionAnswers[question.questionCode].trim() === ""
            ) {
              newErrors[
                `equipment_${eq.id}_question_${question.questionCode}`
              ] = `Pregunta es obligatoria`;
            }
          });
        } catch (error) {
          console.error("Error validando preguntas:", error);
          newErrors[`equipment_${eq.id}_questions`] =
            "Error al validar las preguntas de inspección";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShowSummary = async () => {
    const isValid = await validateForm();
    if (isValid) {
      setShowSummary(true);
    }
  };

  useEffect(() => {
    console.log({ selectedEppTypes, formData });
  }, [selectedEppTypes]);

  const handleConfirmSubmit = async () => {
    setShowSummary(false);
    await handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setLoading(false);
        return;
      }

      setIsSubmitting(true);

      // Preparar datos para envío
      const submitData = {
        ...formData,
        sessionId,
        equipmentIndex: 0, // Para kit de rescate, generalmente es un solo kit
        isKitRescue: true, // Inspección de kit de rescate
      };

      const response = await axios.post(
        "/api/epp-inspections/create",
        submitData
      );

      if (response.data.success) {
        toast.success("Inspección de kit de rescate registrada exitosamente");

        // Limpiar formulario
        setFormData({
          collaboratorName: "",
          collaboratorLastName: "",
          collaboratorNumDoc: "",
          collaboratorTypeDoc: "CC",
          inspectorName: "",
          inspectionDate: new Date(),
          city: "",
          regional: "",
          position: "",
          equipment: [],
        });
        setSelectedEppTypes([]);
        setErrors({});
      } else {
        toast.error("Error al registrar la inspección");
      }
    } catch (error: any) {
      console.error("Error submitting inspection:", error);

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }

      toast.error(
        error.response?.data?.message ||
          "Error al registrar la inspección de kit de rescate"
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header con logos */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Image
              src={LogoClaro}
              alt="Logo Claro"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
            <div className="h-8 w-px bg-gray-300"></div>
            <Image
              src={LogoGrupoHseq}
              alt="Logo Grupo HSEQ"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">
              Inspección de Kit de Rescate
            </h1>
            <p className="text-gray-600">
              Formulario de inspección de equipos de rescate
            </p>
          </div>
        </div>

        {/* Banner informativo */}
        <Banner
          //   icon={<Shield className="h-5 w-5" />}
          label="Inspección de Kit de Rescate"
          desc="Complete el formulario para inspeccionar equipos de kit de rescate. Este formulario es específico para equipos de rescate y emergencia."
          variant="info"
          className="mb-6"
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleShowSummary();
          }}
        >
          {/* Información del Colaborador */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FaUser className="h-5 w-5" />
                Información del Colaborador
              </CardTitle>
              <CardDescription>
                Complete la información del colaborador o instructor que
                inspecciona el kit de rescate.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collaboratorName">Nombre *</Label>
                <Input
                  id="collaboratorName"
                  value={formData.collaboratorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      collaboratorName: e.target.value,
                    }))
                  }
                  placeholder="Nombre del colaborador"
                  className={errors.collaboratorName ? "border-red-500" : ""}
                />
                {errors.collaboratorName && (
                  <p className="text-red-500 text-sm">
                    {errors.collaboratorName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="collaboratorLastName">Apellido *</Label>
                <Input
                  id="collaboratorLastName"
                  value={formData.collaboratorLastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      collaboratorLastName: e.target.value,
                    }))
                  }
                  placeholder="Apellido del colaborador"
                  className={
                    errors.collaboratorLastName ? "border-red-500" : ""
                  }
                />
                {errors.collaboratorLastName && (
                  <p className="text-red-500 text-sm">
                    {errors.collaboratorLastName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="collaboratorNumDoc">
                  Número de Documento *
                </Label>
                <Input
                  id="collaboratorNumDoc"
                  value={formData.collaboratorNumDoc}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      collaboratorNumDoc: e.target.value,
                    }))
                  }
                  placeholder="Número de documento"
                  className={errors.collaboratorNumDoc ? "border-red-500" : ""}
                />
                {errors.collaboratorNumDoc && (
                  <p className="text-red-500 text-sm">
                    {errors.collaboratorNumDoc}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="collaboratorTypeDoc">Tipo de Documento</Label>
                <Select
                  value={formData.collaboratorTypeDoc}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      collaboratorTypeDoc: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione tipo de documento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                    <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                    <SelectItem value="PA">Pasaporte</SelectItem>
                    <SelectItem value="PE">Permiso Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Información de la Inspección */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FaCalendarCheck className="h-5 w-5" />
                Información de la Inspección
              </CardTitle>
              <CardDescription>
                Complete los datos de la inspección y el inspector.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inspectorName">Inspector *</Label>
                <Input
                  id="inspectorName"
                  value={formData.inspectorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inspectorName: e.target.value,
                    }))
                  }
                  placeholder="Nombre del inspector"
                  className={errors.inspectorName ? "border-red-500" : ""}
                />
                {errors.inspectorName && (
                  <p className="text-red-500 text-sm">{errors.inspectorName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Fecha de Inspección *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        errors.inspectionDate ? "border-red-500" : ""
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.inspectionDate ? (
                        format(formData.inspectionDate, "PPP", { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.inspectionDate}
                      onSelect={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          inspectionDate: date || new Date(),
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.inspectionDate && (
                  <p className="text-red-500 text-sm">
                    {errors.inspectionDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="regional">Regional *</Label>
                <Select
                  value={formData.regional}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, regional: value }))
                  }
                >
                  <SelectTrigger
                    className={errors.regional ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione la regional" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionals.map((regional) => (
                      <SelectItem key={regional} value={regional}>
                        {regional}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.regional && (
                  <p className="text-red-500 text-sm">{errors.regional}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, city: e.target.value }))
                  }
                  placeholder="Ciudad"
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  placeholder="Cargo del colaborador"
                />
              </div>
            </CardContent>
          </Card>

          {/* Selección de EPP de Kit de Rescate */}

          <EppSelection
            selectedEppTypes={selectedEppTypes}
            onSelectionChange={handleEppTypeSelection}
            error={errors.eppSelection}
            eppTypes={KIT_RESCATE_TYPES}
          />

          {/* Equipos EPP - Solo mostrar si hay tipos seleccionados */}
          {selectedEppTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-primary">
                  <div className="flex items-center gap-2">
                    <FaFileLines className="h-5 w-5" />
                    Formularios de inspección de kit de rescate
                  </div>
                  <Badge variant="outline" className="text-base">
                    {formData.equipment.length} Inspecciones
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Complete los formularios de inspección para cada equipo de kit
                  de rescate seleccionado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errors.equipment && (
                  <div className="text-red-500 text-sm">{errors.equipment}</div>
                )}

                {formData.equipment.map((equipment, index) => (
                  <EppInspectionSection
                    key={equipment.id}
                    equipment={equipment}
                    index={index}
                    onUpdate={(updates) =>
                      updateEquipment(equipment.id, updates)
                    }
                    onRemove={() => removeEquipment(equipment.id)}
                    errors={errors}
                  />
                ))}

                {/* <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={addEquipment}
                    disabled={formData.equipment.length >= 6}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Equipo de Kit de Rescate
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex justify-between gap-4 w-full mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Cancelar
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleShowSummary}
                disabled={loading || isSubmitting}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Ver Resumen
              </Button>

              <Button
                type="submit"
                disabled={loading || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar Inspección
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Modal de Resumen */}
        {showSummary && (
          <InspectionSummaryModal
            isOpen={showSummary}
            onClose={() => setShowSummary(false)}
            onConfirm={handleConfirmSubmit}
            formData={formData}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
