import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FaHelmetSafety } from "react-icons/fa6";
import { CheckCircle } from "lucide-react";

// Tipos de EPP normales disponibles
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

interface EppSelectionProps {
  selectedEppTypes: string[];
  onSelectionChange: (selectedTypes: string[]) => void;
  error?: string;
  eppTypes?: Array<{ value: string; name: string }>;
}

export const EppSelection: React.FC<EppSelectionProps> = ({
  selectedEppTypes,
  onSelectionChange,
  error,
  eppTypes = EPP_TYPES,
}) => {
  const handleEppTypeToggle = (eppType: string) => {
    const newSelection = selectedEppTypes.includes(eppType)
      ? selectedEppTypes.filter((type) => type !== eppType)
      : [...selectedEppTypes, eppType];

    onSelectionChange(newSelection);
  };

  console.log({eppselectiontype: eppTypes, selectedEppTypes})


  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ">
          <FaHelmetSafety className="h-5 w-5" />
          Selección de Equipos EPP
        </CardTitle>
        <div className="text-sm ">
          Selecciona los equipos que vas a inspeccionar. Mínimo 1, máximo{" "}
          {eppTypes.length}.
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className=" text-base">
            Seleccionados: {selectedEppTypes.length}/{eppTypes.length}
          </Badge>
          {selectedEppTypes.length === 0 && (
            <Badge variant="destructive" className="text-xs">
              Debes seleccionar al menos un equipo
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eppTypes.map((eppType) => (
            <div
              key={eppType.value}
              className={`
                flex items-center space-x-3 p-2 border rounded-lg cursor-pointer 
                transition-all duration-200 hover:scale-[1.02] hover:shadow-sm 
                ${
                  selectedEppTypes.includes(eppType.value)
                    ? "border-blue-500 bg-blue-100 shadow-md"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                }
              `}
              onClick={() => handleEppTypeToggle(eppType.value)}
            >
              <div
                className={`
                  w-6 h-6 min-w-6 min-h-6 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${
                    selectedEppTypes.includes(eppType.value)
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }
                `}
              >
                {selectedEppTypes.includes(eppType.value) && (
                  <CheckCircle className="w-3 h-3 text-white" />
                )}
              </div>
              <Label className="cursor-pointer w-full font-medium text-sm">
                {eppType.name}
              </Label>
              {selectedEppTypes.includes(eppType.value) && (
                <Badge variant="secondary" className="text-xs">
                  Seleccionado
                </Badge>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Instrucciones:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Marca los equipos que vas a inspeccionar</li>
              <li>
                Una vez seleccionados, se habilitarán los formularios
                correspondientes
              </li>
              <li>Puedes agregar o quitar equipos en cualquier momento</li>
              <li>
                Todos los equipos seleccionados deben ser completados
                obligatoriamente
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
