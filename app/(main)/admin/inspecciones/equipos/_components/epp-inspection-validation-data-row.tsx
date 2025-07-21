"use client";
import React, { useState, useEffect } from "react";
import { City } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Trash2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EppInspectionValidationDataRowProps {
  inspection: any;
  handleDeleteCell: (id: string) => void;
  handleValidationChange: (id: string, isValid: boolean, formData?: any) => void;
  cities: City[];
  error?: string;
}

export const EppInspectionValidationDataRow = ({
  inspection,
  handleDeleteCell,
  handleValidationChange,
  cities,
  error,
}: EppInspectionValidationDataRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState({
    collaboratorName: inspection.colaboradorNombre || "",
    collaboratorLastName: inspection.colaboradorApellidos || "",
    collaboratorNumDoc: inspection.colaboradorDocumento || "",
    collaboratorTypeDoc: inspection.colaboradorTipoDoc || "CC",
    city: inspection.ciudad || "",
    regional: inspection.regional || "",
    inspector: inspection.inspector || "",
    eppType: inspection.equipoTipo || "",
    eppName: inspection.equipoNombre || "",
    eppBrand: inspection.marca || "",
    eppModel: inspection.lote || "",
    eppSerialNumber: inspection.serial || "",
    isSuitable: inspection.estadoEquipo === "APTO" || inspection.estadoEquipo === "Apto" || inspection.estadoEquipo === "apto",
    observations: inspection.motivoRechazo || "",
    inspectionDate: inspection.fecha || new Date(),
    certificationDate: inspection.fecha || new Date(),
  });

  // Validar formulario automáticamente
  useEffect(() => {
    const isFormValid = !!(
      formData.collaboratorName &&
      formData.collaboratorLastName &&
      formData.city &&
      formData.regional &&
      formData.inspector &&
      formData.eppBrand &&
      formData.eppSerialNumber
    );

    setIsValid(isFormValid);
    handleValidationChange(inspection.id, isFormValid, formData);
  }, [formData, inspection.id, handleValidationChange]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEppTypeBadgeColor = (eppType: string) => {
    const colors: Record<string, string> = {
      'ARNES_CUERPO_COMPLETO': 'bg-blue-100 text-blue-800',
      'ESLINGA_DOBLE_TERMINAL_EN_Y': 'bg-green-100 text-green-800',
      'ESLINGA_POSICIONAMIENTO': 'bg-yellow-100 text-yellow-800',
      'FRENO_ARRESTADOR_CABLE': 'bg-purple-100 text-purple-800',
      'MOSQUETON': 'bg-orange-100 text-orange-800',
      'ANCLAJE_TIPO_TIE_OFF': 'bg-red-100 text-red-800',
    };
    return colors[eppType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <tr className={`hover:bg-gray-50 ${error ? 'bg-red-50' : ''}`}>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <Badge className={`w-fit text-xs ${getEppTypeBadgeColor(inspection.equipoTipo)}`}>
              {inspection.equipoNombre}
            </Badge>
            <span className="text-xs text-gray-500 mt-1">
              {inspection.marca} - {inspection.serial}
            </span>
          </div>
        </td>
        
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {inspection.colaboradorNombre} {inspection.colaboradorApellidos}
            </span>
            {inspection.colaboradorDocumento && (
              <span className="text-xs text-gray-500">
                {inspection.colaboradorTipoDoc}: {inspection.colaboradorDocumento}
              </span>
            )}
            <span className="text-xs text-gray-500">{inspection.ciudad}</span>
          </div>
        </td>
        
        <td className="px-4 py-3">
          <span className="text-sm">
            {format(new Date(inspection.fecha), "dd/MM/yyyy", { locale: es })}
          </span>
        </td>
        
        <td className="px-4 py-3">
          <span className="text-sm">{inspection.inspector}</span>
        </td>
        
        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            {isValid ? (
              <Badge className="bg-green-100 text-green-800 w-fit">
                <CheckCircle className="w-3 h-3 mr-1" />
                Válido
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800 w-fit">
                <XCircle className="w-3 h-3 mr-1" />
                Inválido
              </Badge>
            )}
            {error && (
              <span className="text-xs text-red-600">{error}</span>
            )}
          </div>
        </td>
        
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCell(inspection.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-4 py-4 bg-gray-50">
            <Card className="p-4">
              <h4 className="font-medium mb-4">Detalles de la Inspección</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Información del Colaborador */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-gray-700">Colaborador</h5>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Nombres</label>
                      <Input
                        value={formData.collaboratorName}
                        onChange={(e) => handleInputChange('collaboratorName', e.target.value)}
                        placeholder="Nombres"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Apellidos</label>
                      <Input
                        value={formData.collaboratorLastName}
                        onChange={(e) => handleInputChange('collaboratorLastName', e.target.value)}
                        placeholder="Apellidos"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Tipo Doc.</label>
                      <Select 
                        value={formData.collaboratorTypeDoc} 
                        onValueChange={(value) => handleInputChange('collaboratorTypeDoc', value)}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CC">CC</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                          <SelectItem value="CE">CE</SelectItem>
                          <SelectItem value="PA">PA</SelectItem>
                          <SelectItem value="PE">PE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Número Doc.</label>
                      <Input
                        value={formData.collaboratorNumDoc}
                        onChange={(e) => handleInputChange('collaboratorNumDoc', e.target.value)}
                        placeholder="Número de documento"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Regional</label>
                    <Input
                      value={formData.regional}
                      onChange={(e) => handleInputChange('regional', e.target.value)}
                      placeholder="Regional"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Ciudad</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ciudad"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Inspector</label>
                    <Input
                      value={formData.inspector}
                      onChange={(e) => handleInputChange('inspector', e.target.value)}
                      placeholder="Nombre del inspector"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Información del Equipo */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-gray-700">Equipo</h5>
                  
                  <div>
                    <label className="text-xs text-gray-600">Tipo de Equipo</label>
                    <Input
                      value={formData.eppName}
                      readOnly
                      className="text-sm bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Marca</label>
                    <Input
                      value={formData.eppBrand}
                      onChange={(e) => handleInputChange('eppBrand', e.target.value)}
                      placeholder="Marca del equipo"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Modelo/Lote</label>
                    <Input
                      value={formData.eppModel}
                      onChange={(e) => handleInputChange('eppModel', e.target.value)}
                      placeholder="Modelo o lote"
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Número de Serie</label>
                    <Input
                      value={formData.eppSerialNumber}
                      onChange={(e) => handleInputChange('eppSerialNumber', e.target.value)}
                      placeholder="Número de serie"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Estado y Observaciones */}
                <div className="space-y-3">
                  <h5 className="font-medium text-sm text-gray-700">Estado</h5>
                  
                  <div>
                    <label className="text-xs text-gray-600">Estado del Equipo</label>
                    <Select 
                      value={formData.isSuitable ? "true" : "false"} 
                      onValueChange={(value) => handleInputChange('isSuitable', value === "true")}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                            Apto
                          </div>
                        </SelectItem>
                        <SelectItem value="false">
                          <div className="flex items-center">
                            <XCircle className="w-4 h-4 mr-2 text-red-600" />
                            No Apto
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Observaciones</label>
                    <Textarea
                      value={formData.observations}
                      onChange={(e) => handleInputChange('observations', e.target.value)}
                      placeholder="Observaciones o motivo de rechazo"
                      className="text-sm min-h-[100px]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </td>
        </tr>
      )}
    </>
  );
}; 