"use client";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { Cloud, FileSpreadsheet, Upload, AlertCircle, Check, RefreshCw, Eye, EyeOff } from "lucide-react";
import { EppInspectionValidationTable } from "./epp-inspection-validation-table";
import { HeaderBulkUploadEppInspections } from "./header-bulk-upload-epp-inspections";
import { toast } from "sonner";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { City } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/banner";

// Mapeo de los tipos de equipos según su posición en el Excel
const EPP_TYPES = [
  'ARNES_CUERPO_COMPLETO',
  'ESLINGA_DOBLE_TERMINAL_EN_Y', 
  'ESLINGA_POSICIONAMIENTO',
  'FRENO_ARRESTADOR_CABLE',
  'MOSQUETON',
  'ANCLAJE_TIPO_TIE_OFF'
];

const EPP_NAMES = [
  'ARNÉS CUERPO COMPLETO',
  'ESLINGA DE DOBLE TERMINAL EN Y',
  'ESLINGA DE POSICIONAMIENTO', 
  'FRENO O ARRESTADOR DE CABLE',
  'MOSQUETÓN',
  'ANCLAJE TIPO TIE OFF'
];

// Función para validar si un registro de Excel tiene los campos mínimos necesarios
const isValidInspectionRecord = (row: any) => {
  const {
    "Fecha": date,
    "Nombre del inspector asignado (Entrenador que se encuentra desarrollando la formación)": inspector,
    "Nombre2": name,
    "Apellidos": lastName,
    "Ciudad": city,
  } = row;

  return !!(
    date &&
    inspector &&
    name &&
    lastName &&
    city
  );
};

// Función para extraer y procesar un equipo específico del registro
const extractEquipmentData = (row: any, equipmentIndex: number) => {
  const suffix = equipmentIndex === 0 ? '' : (equipmentIndex + 1).toString();
  
  return {
    marca: row[`Marca${suffix}`] || '',
    lote: row[`Lote${suffix}`] || '',
    serial: row[`Serial${suffix}`] || '',
    fechaFabricacion: row[`Fecha de fabricación${suffix}`] || '',
    estadoEquipo: row[`Estado del equipo${suffix}`] || '',
    motivoRechazo: row[`Motivo del Rechazo${suffix}`] || '',
    // Campos de inspección específicos (varían por tipo de equipo)
    quemaduras: row[`Quemaduras${suffix}`] || '',
    decoloracion: row[`Decoloración${suffix}`] || '',
    manchasQuimicos: row[`Manchas de químicos${suffix}`] || '',
    costurasSueltas: row[`Costuras sueltas${suffix}`] || '',
    desgasteAbrasion: row[`Desgaste por abrasión${suffix}`] || '',
    fibrasRotas: row[`Fibras rotas${suffix}`] || '',
    cristalizacion: row[`Cristalización${suffix}`] || '',
    rigidezCorrea: row[`Rigidez en la correa o cuerda${suffix}`] || '',
    presenciaMoho: row[`Presencia de moho${suffix}`] || '',
    agujerosPerforaciones: row[`Agujeros o perforaciones${suffix}`] || '',
    corrosion: row[`Corrosión${suffix}`] || '',
    deformacion: row[`Deformación${suffix}`] || '',
    argollasQuiebres: row[`Argollas o hebillas con quiebres o fracturas${suffix}`] || '',
    conexionAdecuada: row[`Conexión adecuada (Argollas y hebillas)${suffix}`] || '',
    segurosAdecuados: row[`Seguros adecuados${suffix}`] || '',
    ganchosCierre: row[`Ganchos con cierre automatico${suffix}`] || '',
    indicadorImpacto: row[`Indicador de impacto activado${suffix}`] || '',
    absorbedorActivado: row[`Absorbedor activado${suffix}`] || '',
  };
};

// Función para convertir fecha de Excel a Date válida
const parseExcelDate = (excelDate: any): Date => {
  if (!excelDate) return new Date();
  
  // Si ya es una fecha válida
  if (excelDate instanceof Date && !isNaN(excelDate.getTime())) {
    return excelDate;
  }
  
  // Si es un string que parece fecha
  if (typeof excelDate === 'string') {
    const parsed = new Date(excelDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  // Si es un número (fecha serial de Excel)
  if (typeof excelDate === 'number') {
    // Excel fecha serial: días desde 1900-01-01 (con corrección por bug de Excel)
    const excelEpoch = new Date(1900, 0, 1);
    const msPerDay = 24 * 60 * 60 * 1000;
    // Excel cuenta desde 1900-01-01 pero tiene un bug donde considera 1900 como año bisiesto
    const correctedDate = new Date(excelEpoch.getTime() + (excelDate - 2) * msPerDay);
    
    if (!isNaN(correctedDate.getTime()) && correctedDate.getFullYear() > 1900) {
      return correctedDate;
    }
  }
  
  return new Date(); // Fallback a fecha actual
};

// Función para formatear los datos del registro principal
const formatInspectionData = (row: any) => {
  const {
    "ID": id,
    "Fecha": date,
    "Nombre del inspector asignado (Entrenador que se encuentra desarrollando la formación)": inspector,
    "Nombre": nombreCompleto,
    "Nombre2": name,
    "Apellidos": lastName,
    "Ciudad": city,
    "Regional": regional,
    "Cargo": position,
  } = row;

  return {
    fecha: parseExcelDate(date),
    inspector: (inspector || "").trim(),
    colaboradorNombre: (name || nombreCompleto || "").trim(),
    colaboradorApellidos: (lastName || "").trim(),
    colaboradorDocumento: (id || "").toString().trim(), // Usar el ID como número de documento
    colaboradorTipoDoc: "CC", // Valor por defecto
    ciudad: (city || "").trim(),
    regional: (regional || "").trim(),
    cargo: (position || "").trim(),
  };
};

// Función para procesar los datos del Excel y generar registros de inspección
const processInspectionData = (rawData: any[]) => {
  const validRecords = rawData.filter((row, index) => index !== 0 && isValidInspectionRecord(row));
  
  const processedInspections: any[] = [];
  
  validRecords.forEach((row) => {
    const baseData = formatInspectionData(row);
    
    // Generar 6 registros de inspección (uno por cada equipo)
    for (let i = 0; i < 6; i++) {
      const equipmentData = extractEquipmentData(row, i);
      
      // Solo crear registro si tiene al menos marca o serial
      if (equipmentData.marca || equipmentData.serial) {
        processedInspections.push({
          ...baseData,
          equipoTipo: EPP_TYPES[i],
          equipoNombre: EPP_NAMES[i],
          equipoIndice: i + 1,
          ...equipmentData,
          id: crypto.randomUUID(), // ID único para el frontend
        });
      }
    }
  });
  
  return processedInspections;
};

interface ApiError {
  inspeccion: any;
  error: string;
}

interface ProcessResult {
  exitoso: boolean;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  errores: ApiError[];
}

export const EppInspectionValidationExcel = ({ cities }: { cities: City[] }) => {
  const [file, setFile] = useState<File | null>();
  const [loadedInspections, setLoadedInspections] = useState<any[]>();
  const [validIds, setValidIds] = useState<string[]>([]);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Array<any & { id: string }>>([]);
  const [validatedForms, setValidatedForms] = useState<Record<string, any>>({});
  
  // Estados para manejo de errores de la API
  const [apiErrors, setApiErrors] = useState<ApiError[]>([]);
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);
  const [inspectionErrors, setInspectionErrors] = useState<Record<string, string>>({});
  const [renderError, setRenderError] = useState<string | null>(null);

  const validCount = useMemo(() => validIds.length, [validIds]);
  const invalidCount = useMemo(() => invalidIds.length, [invalidIds]);

  useEffect(() => {
    if (loadedInspections && loadedInspections.length) {
      setParsedData(loadedInspections);
    }
  }, [loadedInspections]);

  // Función para manejar errores de la API
  const handleApiResponse = (result: ProcessResult) => {
    console.log("API Response:", result);
    setApiErrors(result.errores);
    
    if (result.errores.length > 0) {
      // Mapear errores por clave única (usando datos del colaborador y equipo)
      const errorMap: Record<string, string> = {};
      result.errores.forEach(error => {
        // Crear clave única usando datos del colaborador y equipo
        const key = `${error.inspeccion.collaboratorName}_${error.inspeccion.collaboratorLastName}_${error.inspeccion.eppBrand}_${error.inspeccion.eppSerialNumber}`;
        errorMap[key] = error.error;
      });
      
      // Mapear errores a las inspecciones originales por clave similar
      const updatedInspectionErrors: Record<string, string> = {};
      parsedData.forEach(inspection => {
        const key = `${inspection.colaboradorNombre}_${inspection.colaboradorApellidos}_${inspection.marca}_${inspection.serial}`;
        if (errorMap[key]) {
          updatedInspectionErrors[inspection.id] = errorMap[key];
        }
      });
      
      setInspectionErrors(updatedInspectionErrors);
      
      // Si hay errores, mostrar solo las inspecciones que fallaron
      const failedInspections = parsedData.filter(inspection => {
        const key = `${inspection.colaboradorNombre}_${inspection.colaboradorApellidos}_${inspection.marca}_${inspection.serial}`;
        return errorMap[key];
      });
      
      if (failedInspections.length > 0) {
        // Actualizar la lista para mostrar solo las inspecciones que fallaron
        setParsedData(failedInspections);
        
        // Recalcular validación para las inspecciones que fallaron
        setValidIds([]);
        setInvalidIds([]);
        setValidatedForms({});
        
        // Mostrar solo las fallidas
        setShowOnlyFailed(true);
        
        console.log(`Inspecciones exitosas removidas. Quedan ${failedInspections.length} inspecciones con errores por corregir.`);
      } else {
        // Si no se pudieron mapear errores, mantener todas las inspecciones y mostrar mensaje general
        console.warn("No se pudieron mapear los errores específicos a las inspecciones");
      }
    } else {
      // Si todas fueron exitosas, limpiar toda la lista
      setParsedData([]);
      setValidIds([]);
      setInvalidIds([]);
      setValidatedForms([]);
      setApiErrors([]);
      setInspectionErrors({});
      setShowOnlyFailed(false);
      
      console.log("Todas las inspecciones fueron creadas exitosamente. Lista limpiada.");
    }
  };

  const displayedInspections = parsedData;

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
      // Limpiar errores previos al cargar nuevo archivo
      setApiErrors([]);
      setShowOnlyFailed(false);
      setInspectionErrors({});
    },
    accept: { "application/vnd.ms-excel": [".xlsx", ".xls"] },
    maxFiles: 1,
  });

  useEffect(() => {
    if (!file) return;

    const parseExcelFile = (file: File) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        const processedData = processInspectionData(rawData);
        if(!processedData.length) {
          toast.error("El archivo no contiene datos válidos de inspección. Verifique que el formato sea correcto.", {position: "top-center"});
        }
        console.log({processedData})
        setLoadedInspections(processedData);
      };

      reader.readAsBinaryString(file);
    };

    parseExcelFile(file);
  }, [file]);

  const handleDeleteCell = (id: string) => {
    // Quitar del array principal
    setParsedData((prev) => prev.filter((item) => item.id !== id));

    // Quitar de válidos si existe
    setValidIds((prev) => prev.filter((validId) => validId !== id));

    // Quitar de inválidos si existe
    setInvalidIds((prev) => prev.filter((invalidId) => invalidId !== id));
    
    // Quitar del mapa de errores si existe
    setInspectionErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleValidationChange = (id: string, isValid: boolean, formData?: any) => {
    console.log(`Validation change for ${id}, isValid: ${isValid}`, formData);
    if (isValid) {
      // Si es válido, agregarlo a válidos y quitarlo de inválidos
      setValidIds((prev) => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
      setInvalidIds((prev) => prev.filter((item) => item !== id));
      
      // Guardar los datos validados
      if (formData) {
        setValidatedForms((prev) => ({
          ...prev,
          [id]: formData
        }));
      }
    } else {
      // Si es inválido, agregarlo a inválidos y quitarlo de válidos
      setInvalidIds((prev) => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }
        return prev;
      });
      setValidIds((prev) => prev.filter((item) => item !== id));
      
      // Eliminar los datos validados si existían
      setValidatedForms((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleReloadFile = () => {
    if (file) {
      // Recargar el archivo desde cero
      setApiErrors([]);
      setShowOnlyFailed(false);
      setInspectionErrors({});
      setValidIds([]);
      setInvalidIds([]);
      setValidatedForms({});
      
      // Re-procesar el archivo
      const parseExcelFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(sheet);

          const processedData = processInspectionData(rawData);
          setLoadedInspections(processedData);
        };

        reader.readAsBinaryString(file);
      };

      parseExcelFile(file);
    }
  };

  return (
    <div className="overflow-y-auto bg-white w-full">
      {file && parsedData.length > 0 && (
        <div>
          <HeaderBulkUploadEppInspections
            validInspections={validatedForms}
            file={file}
            invalidCount={invalidCount}
            validCount={validCount}
            totalRecords={displayedInspections.length || 0}
            onApiResponse={handleApiResponse}
          />
        </div>
      )}

      {/* Mostrar información después del procesamiento */}
      {apiErrors.length > 0 && parsedData.length > 0 && (
        <div className="mb-4">
          <Banner
            variant="warning"
            label={`${apiErrors.length} inspecciones fallaron. Las inspecciones exitosas han sido removidas. Corrige los errores y vuelve a intentarlo.`}
            className="mb-3"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReloadFile}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recargar archivo completo
            </Button>
          </div>
        </div>
      )}

      {/* Mostrar mensaje cuando todos fueron exitosos */}
      {apiErrors.length === 0 && file && parsedData.length === 0 && (
        <div className="mb-4">
          <Banner
            variant="success"
            label="¡Todas las certificaciones fueron generadas exitosamente!"
            className="mb-3"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFile(null);
              setLoadedInspections([]);
            }}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Cargar nuevo archivo
          </Button>
        </div>
      )}

      {!file && (
        <div
          {...getRootProps()}
          className={`dropzone w-full flex justify-center mb-5 cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? "border-primary bg-primary/10" 
              : isDragReject 
                ? "border-red-500 bg-red-50" 
                : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
          } border-2 border-dashed rounded-lg py-8 px-4`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4 text-center max-w-md mx-auto py-6">
            {isDragReject ? (
              <>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-red-600 mb-1">Archivo no admitido</p>
                  <p className="text-sm text-slate-500">Solo se permiten archivos Excel (.xlsx, .xls)</p>
                </div>
              </>
            ) : isDragActive ? (
              <>
                <div className="p-3 rounded-full bg-primary/20">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-primary mb-1">Suelta el archivo aquí</p>
                  <p className="text-sm text-slate-500">Tu archivo Excel será procesado automáticamente</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-emerald-50">
                  <PiMicrosoftExcelLogoFill  className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-1">Importar inspecciones de equipos EPP</p>
                  <p className="text-sm text-slate-500 mb-3">
                    Arrastra y suelta tu archivo de Excel o haz clic para seleccionarlo
                  </p>
                  <div className="inline-flex items-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">Seleccionar archivo</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="overflow-auto">
        {renderError ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">Error de renderizado</p>
              <p className="text-red-600 text-sm mt-1">{renderError}</p>
              <button 
                onClick={() => setRenderError(null)}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : displayedInspections && displayedInspections.length > 0 ? (
          (() => {
            try {
              return (
                <EppInspectionValidationTable
                  loadedInspections={displayedInspections}
                  handleDeleteCell={handleDeleteCell}
                  handleValidationChange={handleValidationChange}
                  cities={cities}
                  inspectionErrors={inspectionErrors}
                />
              );
            } catch (error) {
              console.error("Error renderizando tabla:", error);
              setRenderError(error instanceof Error ? error.message : 'Error desconocido');
              return null;
            }
          })()
        ) : file && parsedData.length === 0 && apiErrors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No se encontraron registros válidos en el archivo Excel</p>
            <p className="text-sm text-gray-400 mt-2">
              Verifique que el archivo tenga el formato correcto y contenga datos válidos
            </p>
          </div>
        ) : file ? (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">Estado del procesamiento</p>
              <div className="text-sm text-yellow-700 mt-2 space-y-1">
                <p>Archivo cargado: {file.name}</p>
                <p>Registros procesados: {parsedData.length}</p>
                <p>Errores de API: {apiErrors.length}</p>
                <p>Errores de inspección: {Object.keys(inspectionErrors).length}</p>
                <p>Mostrar solo fallidos: {showOnlyFailed ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
