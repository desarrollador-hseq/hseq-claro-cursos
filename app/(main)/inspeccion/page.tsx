"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
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
import TitlePage from "@/components/title-page";
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

interface EppEquipment {
  id: string;
  eppType: string;
  eppName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufactureDate?: Date;
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

const PublicEppInspection = () => {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  // Agregar nuevo equipo
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
      isSuitable: true, // Por defecto APTO, el usuario puede cambiarlo
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
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    formData.equipment.forEach((eq, index) => {
      if (!eq.eppType) {
        newErrors[`equipment_${eq.id}_type`] = "Tipo de EPP es requerido";
      }
      if (!eq.brand.trim()) {
        newErrors[`equipment_${eq.id}_brand`] = "Marca es requerida";
      }
      if (!eq.serialNumber.trim()) {
        newErrors[`equipment_${eq.id}_serial`] = "Número de serie es requerido";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        "/api/epp-inspections/create",
        formData
      );

      if (response.status !== 200) {
        throw new Error("Error al guardar la inspección");
      }

      const result = response.data;

      toast.success("Inspección guardada exitosamente");

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
    } catch (error) {
      console.error("Error:", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data.message.includes("No equipment provided")) {
          toast.error("No se especificó ningún equipo");
        }
      } else {
        toast.error("Error al guardar la inspección");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl bg-primary">
      <TitlePage
        title="Formulario de Inspección EPP"
        description="Complete la información del colaborador y registre la inspección de equipos de protección personal"
      />

      <div className="space-y-6">
        {/* Información del Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
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
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
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
                      selected={formData.inspectionDate}
                      onSelect={(date) =>
                        date &&
                        setFormData((prev) => ({
                          ...prev,
                          inspectionDate: date,
                        }))
                      }
                      initialFocus
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

        {/* Equipos EPP */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-emerald-600" />
                </div>
                Equipos de Protección Personal
              </div>
              <Badge variant="outline">
                {formData.equipment.length}/6 equipos
              </Badge>
            </CardTitle>
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

            <Button
              type="button"
              variant="outline"
              onClick={addEquipment}
              disabled={formData.equipment.length >= 6}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Equipo EPP ({formData.equipment.length}/6)
            </Button>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-4">
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
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Inspección
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PublicEppInspection;
