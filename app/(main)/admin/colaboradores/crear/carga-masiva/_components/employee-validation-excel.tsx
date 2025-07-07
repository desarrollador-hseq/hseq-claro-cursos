"use client";
import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useDropzone } from "react-dropzone";
import { Cloud, FileSpreadsheet, Upload, AlertCircle, Check } from "lucide-react";
import { EmployeeValidationTable } from "./bulk-upload-employees-table";
import { HeaderBulkUploadEmployees } from "./header-bulk-upload-employees";
import { toast } from "sonner";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";

const isValidEmployee = (row: any) => {
  const {
    Nombres: name,
    Apellidos: lastName,
    "# Documento": identificationNumber,
  } = row;

  // Quitamos phone de la validación
  return !!(
    name &&
    lastName &&
    identificationNumber
  );
};

const formatEmployeeData = (row: any) => {
  const {
    Nombres: name,
    Apellidos: lastName,
    "# Documento": identificationNumber,
  } = row;

  return {
    name: (name || "").trim(),
    lastName: (lastName || "").trim(),
    identificationNumber: ("" + identificationNumber)
      .replace(/[.,]/g, "")
      .trim(),
  };
};

const processEmployeeData = (rawData: any[]) => {
  return rawData
    .filter((row, index) => index !== 0 && isValidEmployee(row))
    .map(formatEmployeeData);
};

export const EmployeeValidationExcel = () => {
  //   let parsedData: unknown[] = [];
  const [file, setFile] = useState<File | null>();
  const [loadedEmployees, setloadedEmployees] = useState<any[]>();

  const [validIds, setValidIds] = useState<string[]>([]);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Array<any & { id: string }>>([]);
  const [validatedForms, setValidatedForms] = useState<Record<string, any>>({});
  const validCount = useMemo(() => validIds.length, [validIds]);
  const invalidCount = useMemo(() => invalidIds.length, [invalidIds]);

  useEffect(() => {
    if (loadedEmployees && loadedEmployees.length) {
      // Asignar un ID único a cada registro
      const dataWithIds = loadedEmployees.map((item) => ({
        ...item,
        id: crypto.randomUUID(), // o cualquier generador de ID único
      }));
      setParsedData(dataWithIds);
    }
  }, [loadedEmployees]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFile(acceptedFiles[0]);
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

        const processedData = processEmployeeData(rawData);
        if(!processedData.length) {
          toast.error("El archivo no fue modificado, por favor descarga la plantilla y no modifiques ningun dato de la cabecera de la tabla", {position: "top-center"});
        }
        console.log({processedData})
        setloadedEmployees(processedData);
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
  return (
    <div className="overflow-y-auto bg-white w-full">
      {file && parsedData.length > 0 && (
        <div>
          <HeaderBulkUploadEmployees
            validEmployees={validatedForms}
            file={file}
            invalidCount={invalidCount}
            validCount={validCount}
            totalRecords={parsedData.length || 0}
          />
        </div>
      )}
      {parsedData.length === 0 && (
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
                  <p className="font-medium text-gray-700 mb-1">Importar listado de colaboradores</p>
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
        {parsedData && parsedData.length > 0 && (
          <EmployeeValidationTable
            loadedEmployees={parsedData}
            handleDeleteCell={handleDeleteCell}
            handleValidationChange={handleValidationChange}
          />
        )}
      </div>
    </div>
  );
};
