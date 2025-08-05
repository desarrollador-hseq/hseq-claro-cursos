"use client";
import React from "react";
import { City } from "@prisma/client";
import { EppInspectionValidationDataRow } from "./epp-inspection-validation-data-row";

interface EppInspectionValidationTableProps {
  loadedInspections: any[];
  handleDeleteCell: (id: string) => void;
  handleValidationChange: (id: string, isValid: boolean, formData?: any) => void;
  cities: City[];
  inspectionErrors: Record<string, string>;
}

export const EppInspectionValidationTable = ({
  loadedInspections,
  handleDeleteCell,
  handleValidationChange,
  cities,
  inspectionErrors,
}: EppInspectionValidationTableProps) => {
  
  // Validación de datos de entrada
  if (!loadedInspections || !Array.isArray(loadedInspections)) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No hay datos de inspecciones para mostrar</p>
        </div>
      </div>
    );
  }

  if (loadedInspections.length === 0) {
    return (
      <div className="w-full">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600">No hay inspecciones cargadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Inspecciones EPP por Validar
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Revisa y valida cada inspección antes de generar las certificaciones ({loadedInspections.length} registros)
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colaborador
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inspección
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadedInspections.map((inspection, index) => {
                try {
                  return (
                    <EppInspectionValidationDataRow
                      key={inspection.id || `inspection-${index}`}
                      inspection={inspection}
                      handleDeleteCell={handleDeleteCell}
                      handleValidationChange={handleValidationChange}
                      cities={cities}
                      error={inspectionErrors[inspection.id]}
                    />
                  );
                } catch (error) {
                  console.error(`Error renderizando fila ${index}:`, error, inspection);
                  return (
                    <tr key={`error-${index}`}>
                      <td colSpan={6} className="px-4 py-3 text-red-600 text-sm">
                        Error renderizando inspección #{index + 1}: {error instanceof Error ? error.message : 'Error desconocido'}
                      </td>
                    </tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}; 