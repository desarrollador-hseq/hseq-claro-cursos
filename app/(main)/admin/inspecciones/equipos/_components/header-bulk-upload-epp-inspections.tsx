"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Upload, Loader2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface HeaderBulkUploadEppInspectionsProps {
  validInspections: Record<string, any>;
  file: File;
  invalidCount: number;
  validCount: number;
  totalRecords: number;
  onApiResponse: (result: any) => void;
}

export const HeaderBulkUploadEppInspections = ({
  validInspections,
  file,
  invalidCount,
  validCount,
  totalRecords,
  onApiResponse,
}: HeaderBulkUploadEppInspectionsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcessInspections = async () => {
    if (validCount === 0) {
      toast.error("No hay inspecciones válidas para procesar");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      // Preparar datos para envío
      const inspectionsToProcess = Object.values(validInspections);
      
      const response = await axios.post("/api/epp-certifications/mass-create", {
        inspections: inspectionsToProcess,
        fileName: file.name,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const result = response.data;
      
      if (result.exitoso) {
        toast.success(`¡Éxito! Se generaron ${result.exitosos} certificaciones EPP`);
      } else {
        toast.warning(`Se procesaron ${result.exitosos} de ${result.totalProcesados} certificaciones`);
      }

      onApiResponse(result);

    } catch (error: any) {
      console.error("Error al procesar certificaciones:", error);
      
      if (error.response?.data?.errores) {
        onApiResponse(error.response.data);
        toast.error("Algunas certificaciones fallaron. Revisa los errores.");
      } else {
        toast.error("Error al procesar las certificaciones EPP");
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const getProgressPercentage = () => {
    if (totalRecords === 0) return 0;
    return Math.round((validCount / totalRecords) * 100);
  };

  return (
    <div className="bg-white border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Información del archivo */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {file.name}
            </h3>
            <p className="text-sm text-gray-600">
              Archivo de inspecciones EPP cargado
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">
              <span className="font-medium">{totalRecords}</span>
              <span className="ml-1">Total</span>
            </Badge>
            
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span className="font-medium">{validCount}</span>
              <span className="ml-1">Válidas</span>
            </Badge>
            
            {invalidCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="w-3 h-3 mr-1" />
                <span className="font-medium">{invalidCount}</span>
                <span className="ml-1">Inválidas</span>
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso de validación */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progreso de validación
          </span>
          <span className="text-sm text-gray-600">
            {getProgressPercentage()}%
          </span>
        </div>
        <Progress value={getProgressPercentage()} className="h-2" />
      </div>

      {/* Barra de progreso de procesamiento */}
      {isProcessing && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Generando certificaciones EPP...
            </span>
            <span className="text-sm text-gray-600">
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Botón de acción */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleProcessInspections}
          disabled={validCount === 0 || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generando certificaciones...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Generar {validCount} certificaciones EPP
            </>
          )}
        </Button>
      </div>

      {/* Información adicional */}
      {validCount > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>¿Qué sucederá?</strong> Se generarán {validCount} certificaciones de inspección EPP 
            en la base de datos. Cada inspección válida creará un registro en EppCertificationInspection.
          </p>
        </div>
      )}

      {invalidCount > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Atención:</strong> {invalidCount} inspecciones tienen errores y no serán procesadas. 
            Expande las filas para revisar y corregir los errores.
          </p>
        </div>
      )}
    </div>
  );
}; 