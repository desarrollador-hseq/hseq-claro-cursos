import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

import { UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { PiMicrosoftExcelLogo } from "react-icons/pi";

interface ProcessResult {
  exitoso: boolean;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  errores: Array<{
    empleado: any;
    error: string;
  }>;
}

export const HeaderBulkUploadEmployees = ({
  file,
  validEmployees,
  invalidCount,
  validCount,
  totalRecords,
  onApiResponse,
}: {
  file: File;
  validEmployees: Record<string, any>;
  invalidCount: number;
  validCount: number;
  totalRecords: number;
  onApiResponse?: (result: ProcessResult) => void;
}) => {
  const [listErrors, setListErrors] = useState<unknown[]>([]);
  const [wasError, setWasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkUploadEmployees = async (empleados: any[]) => {
    try {
      console.log({ empleadosToCreate: empleados });
      const { data } = await axios.post(
        `/api/colaboradores/mass-create`,
        empleados
      );
      console.log({ bulkUploadResponse: data });
      return data;
    } catch (error: any) {
      console.log({ bulkUploaderror: error });
      console.log({ bulkUploaderrordata: error.response?.data });
      throw error;
    }
  };

  const onClick = async () => {
    const validatedFormsArray = Object.values(validEmployees);

    console.log("Datos validados a enviar:", validatedFormsArray);

    if (validatedFormsArray.length === 0) {
      toast.error("No hay empleados válidos para procesar");
      return;
    }

    setIsLoading(true);
    setWasError(false);
    setListErrors([]);

    try {
      toast.loading(`Procesando ${validatedFormsArray.length} empleados...`, {
        id: "mass-create-loading"
      });

      const response = await handleBulkUploadEmployees(validatedFormsArray);
      
      toast.dismiss("mass-create-loading");

      
      
      // Llamar al callback con la respuesta
      if (onApiResponse) {
        onApiResponse(response);
      }
      
      if (response.exitoso) {
        toast.success(`✅ ¡Proceso completado! ${response.exitosos} empleados creados exitosamente`, {
          duration: 5000
        });
        console.log(`✅ Creación masiva exitosa: ${response.exitosos}/${response.totalProcesados} empleados creados`);
      } else {
        toast.warning(`⚠️ Proceso completado con errores: ${response.exitosos} exitosos, ${response.fallidos} fallidos`, {
          duration: 7000
        });
        console.log(`⚠️ Creación masiva con errores: ${response.exitosos} exitosos, ${response.fallidos} fallidos`);
        console.log("Errores:", response.errores);
      }
      
      setListErrors(response.errores);
      console.log({ massCreateResponse: response });
    } catch (error: any) {
      toast.dismiss("mass-create-loading");
      toast.error("Error al procesar empleados. Revisa los logs para más detalles.", {
        duration: 7000
      });
      
      setWasError(true);
      console.log({ massCreateError: error });
      
      // Si hay errores en la respuesta del servidor
      if (error.response?.data?.errores) {
        setListErrors(error.response.data.errores);
        if (onApiResponse) {
          onApiResponse(error.response.data);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* {mutation.isPending && ( */}
        {/* <Banner
          variant="info"
          label="El proceso puede llevar varios minutos según la cantidad de colaboradores que se estén registrando. Por favor, evite recargar la página o cerrarla mientras se lleva a cabo el proceso"
          className="mb-5"
        /> */}
      {/* )} */}
      {invalidCount > 0 && (
        <Banner
          variant="danger"
          label="Debes corregir los errores en la lista de colaboradores para poder subir los registros"
          className="mb-5"
        />
      )}

      {listErrors.length > 0 && (
        <Banner
          variant="warning"
          label={`Se encontraron ${listErrors.length} errores durante el proceso de creación masiva. Revisa la consola para más detalles.`}
          className="mb-5"
        />
      )}

      {wasError && (
        <Banner
          variant="danger"
          label="Ocurrió un error durante el proceso de creación masiva. Revisa la consola para más detalles."
          className="mb-5"
        />
      )}

      <div
        className={cn(
          `p-2 grid grid-cols-3 gap-4 lg:grid-cols-5 text-white rounded-sm ${
            file
              ? invalidCount !== 0
                ? "bg-red-600/80"
                : "bg-emerald-800/80"
              : ""
          }`
        )}
      >
        <div className="flex col-span-4 lg:col-span-1 bg-emerald-700 border-2 border-emerald-800 shadow-sm items-center justify-center rounded-sm overflow-hidden divide-x divide-zinc-200 p-3">
          <div className="px-3 py-2 h-full grid place-items-center">
            <PiMicrosoftExcelLogo className="w-8 h-8 text-white" />
          </div>
          <p className="px-3 py-2 h-full text-sm truncate text-white font-semibold max-w-[300px] text-ellipsis line-clamp-1">
            {file.name}
          </p>
        </div>
        <div className="w-full place-content-center place-items-center">
          <div># registros Válidos</div>
          <span className="text-lg font-bold">{validCount}</span>
        </div>
        <div className="w-full place-content-center place-items-center">
          <div># registros inválidos</div>
          <span className="text-lg font-bold">{invalidCount}</span>
        </div>
        <div className="w-full place-content-center place-items-center">
          <div>Total registros</div>
          <span className="text-lg font-bold">{totalRecords}</span>
        </div>
        <div className="col-span-4 lg:col-span-1 place-content-center place-items-center">
          <Button
            disabled={invalidCount !== 0 || isLoading}
            onClick={onClick}
            className={
              "gap-2 p-5 text-lg disabled:bg-slate-400 disabled:hover:bg-slate-300 disabled:cursor-not-allowed"
            }
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <UploadCloud /> Cargar
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
