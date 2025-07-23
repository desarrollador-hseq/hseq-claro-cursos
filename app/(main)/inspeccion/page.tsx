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
import { EppInspectionSection } from "./_components/epp-inspection-section";
import { InspectionSummaryModal } from "./_components/epp-inspection-section";
import { EppSelection } from "./_components/epp-selection";
import TitlePage from "@/components/title-page";
import axios from "axios";
import { FaCalendarCheck, FaFileLines, FaHelmetSafety, FaUser } from "react-icons/fa6";
import { Banner } from "@/components/ui/banner";

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

export default function InspectionPage() {
  const [selectedEppTypes, setSelectedEppTypes] = useState<string[]>([]);
  const [inspectionSession, setInspectionSession] = useState<InspectionSession>({
    sessionId: crypto.randomUUID(),
    createdAt: new Date(),
    totalInspections: 0,
    completedInspections: 0,
  });
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
  const [showSummaryModal, setShowSummaryModal] = useState(false); // Estado para el modal
  const [regionals, setRegionals] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loadingRegionals, setLoadingRegionals] = useState(true);

  // Cargar regionales al montar el componente
  useEffect(() => {
    const fetchRegionals = async () => {
      try {
        const response = await axios.get("/api/regional");
        if (response.status === 200) {
          const data = response.data;
          setRegionals(data.regionals || []);
        } else {
          toast.error("Error al cargar las regionales");
        }
      } catch (error) {
        console.error("Error fetching regionals:", error);
        toast.error("Error al cargar las regionales");
      } finally {
        setLoadingRegionals(false);
      }
    };

    fetchRegionals();
  }, []);

  // Sincronizar tipos seleccionados con equipos existentes
  useEffect(() => {
    const existingTypes = formData.equipment.map(eq => eq.eppType).filter(Boolean);
    if (existingTypes.length > 0 && selectedEppTypes.length === 0) {
      setSelectedEppTypes(existingTypes);
    }
  }, [formData.equipment, selectedEppTypes.length]);

  // Manejar selección de tipos de EPP
  const handleEppTypeSelection = (selectedTypes: string[]) => {
    setSelectedEppTypes(selectedTypes);
    
    // Sincronizar equipos con la selección
    const currentEquipmentTypes = formData.equipment.map(eq => eq.eppType);
    
    // Agregar equipos para tipos seleccionados que no existen
    const newEquipment: EppEquipment[] = selectedTypes
      .filter(type => !currentEquipmentTypes.includes(type))
      .map(type => ({
        id: crypto.randomUUID(),
        eppType: type,
        eppName: EPP_TYPES.find(epp => epp.value === type)?.name || type,
        brand: "",
        model: "",
        serialNumber: "",
        manufacturingDate: undefined,
        isSuitable: true,
        observations: "",
        inspectionAnswers: {},
      }));

    // Remover equipos que ya no están seleccionados
    const filteredEquipment = formData.equipment.filter(eq => 
      selectedTypes.includes(eq.eppType)
    );

    setFormData(prev => ({
      ...prev,
      equipment: [...filteredEquipment, ...newEquipment]
    }));
  };

  // Agregar nuevo equipo (mantener para compatibilidad)
  const addEquipment = () => {
    if (formData.equipment.length >= 6) {
      toast.error("Máximo 6 equipos por inspección");
      return;
    }

    const newEquipment: EppEquipment = {
      id: crypto.randomUUID(),
      eppType: "",
      eppName: "",
      brand: "",
      model: "",
      serialNumber: "",
      manufacturingDate: undefined,
      isSuitable: true,
      observations: "",
      inspectionAnswers: {},
    };

    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, newEquipment],
    }));
  };

  // Remover equipo
  const removeEquipment = (equipmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((eq) => eq.id !== equipmentId),
    }));
  };

  // Actualizar equipo
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

    // Validar selección de EPP
    if (selectedEppTypes.length === 0) {
      newErrors.eppSelection = "Debes seleccionar al menos un equipo EPP para inspeccionar";
    }

    // Validar información del colaborador
    if (!formData.collaboratorName.trim()) {
      newErrors.collaboratorName = "Nombre es requerido";
    }
    if (!formData.collaboratorLastName.trim()) {
      newErrors.collaboratorLastName = "Apellidos son requeridos";
    }
    if (!formData.collaboratorNumDoc.trim()) {
      newErrors.collaboratorNumDoc = "Número de documento es requerido";
    }

    // Validar información de inspección
    if (!formData.inspectorName.trim()) {
      newErrors.inspectorName = "Inspector es requerido";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Ciudad es requerida";
    }
    if (!formData.regional.trim()) {
      newErrors.regional = "Regional es requerida";
    }

    // Validar equipos
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
          const response = await axios.get(`/api/epp-questions?eppType=${encodeURIComponent(eq.eppType)}`);
          const questions = response.data.questions || [];
          
          if (questions.length === 0) {
            newErrors[`equipment_${eq.id}_questions`] = "No se pudieron cargar las preguntas para este tipo de EPP";
            continue;
          }

          const answeredQuestions = questions.filter((q: any) => 
            eq.inspectionAnswers?.[q.questionCode] && 
            eq.inspectionAnswers[q.questionCode].trim() !== ""
          );

          if (answeredQuestions.length < questions.length) {
            newErrors[`equipment_${eq.id}_questions`] = 
              `Debe responder todas las preguntas de inspección (${answeredQuestions.length}/${questions.length})`;
          }

          // Validar cada pregunta individual
          questions.forEach((question: any) => {
            if (!eq.inspectionAnswers?.[question.questionCode] || 
                eq.inspectionAnswers[question.questionCode].trim() === "") {
              newErrors[`equipment_${eq.id}_question_${question.questionCode}`] = 
                `Pregunta es obligatoria`;
            }
          });

        } catch (error) {
          console.error("Error validando preguntas:", error);
          newErrors[`equipment_${eq.id}_questions`] = "Error al validar las preguntas de inspección";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para abrir el modal de resumen
  const handleShowSummary = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }
    setShowSummaryModal(true);
  };

  // Función para confirmar y enviar el formulario desde el modal
  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Crear inspecciones individuales para cada equipo
      const inspectionPromises = formData.equipment.map(async (equipment) => {
        const inspectionData = {
          ...formData,
          equipment: [equipment], // Solo un equipo por inspección
          sessionId: inspectionSession.sessionId, // ID de sesión para agrupar
          equipmentIndex: formData.equipment.indexOf(equipment) + 1, // Índice del equipo en la sesión
        };

        console.log(`Enviando inspección ${equipment.eppName}:`, inspectionData);

        return axios.post("/api/epp-inspections/create", inspectionData);
      });

      // Ejecutar todas las inspecciones en paralelo
      const responses = await Promise.all(inspectionPromises);
      
      // Verificar que todas las inspecciones se guardaron correctamente
      const successfulInspections = responses.filter(response => response.status === 200);
      
      if (successfulInspections.length === formData.equipment.length) {
        // Actualizar contador de sesión
        setInspectionSession(prev => ({
          ...prev,
          totalInspections: prev.totalInspections + formData.equipment.length,
          completedInspections: prev.completedInspections + formData.equipment.length,
        }));

        toast.success(
          `${formData.equipment.length} inspección(es) guardada(s) exitosamente. Sesión: ${inspectionSession.sessionId.slice(0, 8)}...`
        );

        // Cerrar modal y limpiar formulario
        setShowSummaryModal(false);
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
      } else {
        throw new Error(`Solo ${successfulInspections.length} de ${formData.equipment.length} inspecciones se guardaron`);
      }
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data.message.includes("No equipment provided")) {
          toast.error("No se especificó ningún equipo");
        } else {
          toast.error(error.response?.data.message || "Error al guardar las inspecciones");
        }
      } else {
        toast.error("Error al guardar las inspecciones");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modificar handleSubmit original (mantener por compatibilidad pero no usar)
  const handleSubmit = async () => {
    handleShowSummary(); // Redirigir al modal de resumen
  };

  return (
    <div className="container mx-auto py-2 px-1 lg:px-4 max-w-6xl bg-primary xl:rounded-lg xl:my-1">
      <div className="flex justify-between gap-2">
        <div className="h-10 flex justify-start items-center">
          <Image
            priority
            src={LogoClaro}
            alt="logo de Claro"
            height={40}
            width={70}
          />
          {/* <LogoClaro goRoot className="flex" /> */}
        </div>
        <div className="h-8 flex">
          <Image
            priority
            src={LogoGrupoHseq}
            alt="logo de Grupo HSEQ"
            height={20}
            width={70}
          />
          {/* <LogoClaro goRoot className="flex" /> */}
        </div>
      </div>
      <Card className="mb-2 bg-primary border-none py-0">
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-white font-bold text-2xl text-center">
            Formulario de Inspección EPP
          </CardTitle>
          <CardDescription className="text-slate-100 mt-2 text-center">
            Complete la información del colaborador y registre la inspección de
            equipos de protección personal
          </CardDescription>
        </CardHeader>
      </Card>

      <Banner
        icon={Info}
        className="mb-3 rounded-md"
        variant="info"
        label="Registra hasta 6 equipos de protección personal asignados al mismo tiempo."
      />

      {/* Información de Sesión */}
      <Card className="mb-3 border-blue-200 bg-blue-50">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium text-blue-900">
                Sesión de Inspección:
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {inspectionSession.sessionId.slice(0, 8)}...
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-blue-700">
                Creada: {inspectionSession.createdAt.toLocaleDateString()}
              </span>
              {inspectionSession.totalInspections > 0 && (
                <span className="text-blue-700">
                  Inspecciones: {inspectionSession.completedInspections}/{inspectionSession.totalInspections}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Información del Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FaUser className="h-5 w-5" />
              Información del Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="collaboratorName">Nombres *</Label>
                <Input
                  id="collaboratorName"
                  value={formData.collaboratorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      collaboratorName: e.target.value,
                    }))
                  }
                  placeholder="Nombres del colaborador"
                  className={errors.collaboratorName ? "border-red-500" : ""}
                />
                {errors.collaboratorName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.collaboratorName}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="collaboratorLastName">Apellidos *</Label>
                <Input
                  id="collaboratorLastName"
                  value={formData.collaboratorLastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      collaboratorLastName: e.target.value,
                    }))
                  }
                  placeholder="Apellidos del colaborador"
                  className={
                    errors.collaboratorLastName ? "border-red-500" : ""
                  }
                />
                {errors.collaboratorLastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.collaboratorLastName}
                  </p>
                )}
              </div>

              <div>
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
                    <SelectValue />
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.collaboratorNumDoc}
                  </p>
                )}
              </div>

              <div>
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
            </div>
          </CardContent>
        </Card>

        {/* Información de la Inspección */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <FaCalendarCheck className="h-5 w-5" />
              Información de la Inspección
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="inspectorName">Inspector Asignado *</Label>
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.inspectorName}
                  </p>
                )}
              </div>

              <div>
                <Label>Fecha de Inspección</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.inspectionDate, "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      locale={es}
                      selected={formData.inspectionDate}
                      onSelect={(date) =>
                        date &&
                        setFormData((prev) => ({
                          ...prev,
                          inspectionDate: date,
                        }))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="regional">Regional *</Label>
                <Select
                  value={formData.regional}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, regional: value }))
                  }
                  disabled={loadingRegionals}
                >
                  <SelectTrigger
                    className={errors.regional ? "border-red-500" : ""}
                  >
                    <SelectValue
                      placeholder={
                        loadingRegionals
                          ? "Cargando regionales..."
                          : "Seleccionar regional"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {regionals.map((regional) => (
                      <SelectItem key={regional.id} value={regional.name}>
                        {regional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.regional && (
                  <p className="text-red-500 text-sm mt-1">{errors.regional}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="city">Ciudad *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                placeholder="Ciudad de la inspección"
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selección de EPP */}
        <EppSelection
          selectedEppTypes={selectedEppTypes}
          onSelectionChange={handleEppTypeSelection}
          error={errors.eppSelection}
        />

        {/* Equipos EPP - Solo mostrar si hay tipos seleccionados */}
        {selectedEppTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-primary">
                <div className="flex items-center gap-2">
                  <FaFileLines className="h-5 w-5" />
                  Formularios de inspección
                </div>
                <Badge variant="outline" className="text-base">
                  {formData.equipment.length} Inspecciones
                </Badge>
              </CardTitle>
              <CardDescription>
                Complete los formularios de inspección para cada equipo seleccionado.
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
                  onUpdate={(updates) => updateEquipment(equipment.id, updates)}
                  onRemove={() => removeEquipment(equipment.id)}
                  errors={errors}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Botones de Acción */}
        <div className="flex justify-between gap-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
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
              })
            }
          >
            Limpiar Formulario
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || formData.equipment.length === 0}
            className="min-w-[140px]"
            variant="secondary"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Revisar y Guardar{" "}
                {formData.equipment.length > 1 ? "Inspecciones" : "Inspección"}
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Resumen */}
      <InspectionSummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
