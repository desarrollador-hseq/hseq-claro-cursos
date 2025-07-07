import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";

import { UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { PiMicrosoftExcelLogo } from "react-icons/pi";

export const HeaderBulkUploadEmployees = ({
  file,
  validEmployees,
  invalidCount,
  validCount,
  totalRecords,
}: {
  file: File;
  validEmployees: Record<string, any>;
  invalidCount: number;
  validCount: number;
  totalRecords: number;
}) => {
  const [listErrors, setListErrors] = useState<unknown[]>([]);
  const [wasError, setWasError] = useState(false);
  // const { mutateAsync: mutationAsync, isPending } = useBulkUploadEmployees();

  const handleBulkUploadEmployees = async (values: any) => {
    try {
      console.log({ valuesvalues: values });
      const { data } = await axios.post(
        `api
        
        /colaboradores/mass-create`,
        values
      );
      console.log({ bulkUploaddata: data });
      return data;
    } catch (error: any) {
      console.log({ bulkUploaderror: error });
      console.log({ bulkUploaderrordata: error.response.data });
      // handleAxiosError(error, "Ocurrió un error inesperado");
    }
  };

  const onClick = async () => {
    const validatedFormsArray = Object.values(validEmployees);

    console.log("Datos validados a enviar:", validatedFormsArray);

    try {
      const { data } = await handleBulkUploadEmployees({
        values: validatedFormsArray,
      });
      // setListErrors(data?.errors);
      console.log({ masivodata: data });
    } catch (error) {
      // setWasError(true);
      // const errors = error?.cause?.errors || [];
      // // setListErrors(errors);
      // console.log({ masivoerror: error, errors });
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
            disabled={invalidCount !== 0}
            onClick={onClick}
            className={
              "gap-2 p-5 text-lg disabled:bg-slate-400 disabled:hover:bg-slate-300 disabled:cursor-not-allowed"
            }
          >
            <UploadCloud /> Cargar
          </Button>
        </div>
      </div>
    </>
  );
};
