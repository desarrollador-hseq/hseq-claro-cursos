"use client";

import React, { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { City, DocType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const docTypeOptions = [
  { value: DocType.CC, label: "CC" },
  { value: DocType.CE, label: "CE" },
  { value: DocType.PA, label: "PA" },
  { value: DocType.PE, label: "PE" },
  { value: DocType.TI, label: "TI" },
];

const mapExcelDocTypeToEnum = (excelValue: string): DocType | undefined => {
  // Mapa de valores del Excel a valores del enum
  const docTypeMap: Record<string, DocType> = {
    CC: DocType.CC,
    CE: DocType.CE,
    PA: DocType.PA,
    PE: DocType.PE,
    TI: DocType.TI,
  };

  // Intenta encontrar una coincidencia exacta
  if (excelValue in docTypeMap) {
    return docTypeMap[excelValue];
  }

  // Si no hay coincidencia exacta, intenta encontrar una coincidencia parcial
  const lowercaseExcelValue = excelValue.toLowerCase();
  for (const [key, value] of Object.entries(docTypeMap)) {
    if (
      key.toLowerCase().includes(lowercaseExcelValue) ||
      lowercaseExcelValue.includes(key.toLowerCase())
    ) {
      return value;
    }
  }

  // Si no se encuentra ninguna coincidencia, devuelve undefined
  return undefined;
};

// Esquema de validación con Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
  lastName: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  identificationNumber: z.string().min(7, { message: "Mínimo 7 caracteres" }),
  docType: z.string().min(1, { message: "Tipo de documento requerido" }),
  cityId: z.string().min(1, { message: "requerido" }),
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .optional()
    .nullable()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export const EmployeeValidationDataRow = ({
  row,
  deleteCell,
  onValidationChange,
  cities,
  apiError,
}: {
  row: any;
  deleteCell: (i: string) => void;
  onValidationChange: (
    id: string,
    isValid: boolean,
    formData?: FormValues
  ) => void;
  cities: City[];
  apiError?: string;
}) => {
  const { name, lastName, identificationNumber, docType, city, email } = row;

  const [isClient, setIsClient] = useState<boolean>(false);
  const [wasPreviouslyValid, setWasPreviouslyValid] = useState<boolean | null>(
    null
  );
  const [lastValidValues, setLastValidValues] = useState<FormValues | null>(
    null
  );

  // Utiliza formState.isValid para una validación más confiable

  // Encontrar IDs iniciales
  const findInitialCityId = () => {
    if (city) {
      console.log({ cities, city });
      const cityFound = cities.find((ct) => ct.realName == city);
      return cityFound?.id || "";
    }
    return "";
  };

  // Formulario con react-hook-form y Zod
  const { register, formState, watch, getValues, trigger, setValue, setError } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        name: name || "",
        lastName: lastName || "",
        identificationNumber: identificationNumber || "",
        docType: docType || "",
        cityId: findInitialCityId() || "",
        email: email || "",
      },
      mode: "onChange",
    });

  const { errors, isValid, dirtyFields } = formState;
  const watchedValues = watch();

  useEffect(() => {
    if (isClient) {
      // Usamos una bandera para asegurarnos de que solo se ejecute una vez al inicio
      const initialValidationTimeout = setTimeout(() => {
        trigger().then((isValid) => {
          console.log("Initial validation result:", isValid);
          if (isValid) {
            onValidationChange(row.id, true, getValues());
          } else {
            onValidationChange(row.id, false);
          }
        });
      }, 0);

      return () => clearTimeout(initialValidationTimeout);
    }
    // Solo dependemos de isClient y row.id que no cambian entre renders
  }, [isClient, row.id]);

  useEffect(() => {
    if (isClient && docType) {
      const mappedValue = mapExcelDocTypeToEnum(docType);
      console.log(`Mapping "${docType}" to enum:`, mappedValue);

      if (mappedValue === undefined) {
        // El valor no se pudo mapear, establecer error manual
        setError("docType", {
          type: "manual",
          message: `No se pudo reconocer "${docType}" como tipo de contrato válido`,
        });
      } else {
        // El valor se mapeó correctamente, establecerlo
        setValue("docType", mappedValue, { shouldValidate: true });
      }
    }
  }, [isClient, docType, setValue, setError]);

  // Activar cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log({ watch: watch() });
  }, [watch()]);

  // Notificar al padre sobre la validación
  useEffect(() => {
    if (!isClient) return;

    const formIsValid = formState.isValid;

    // Verificar si cambiaron los valores desde la última validación exitosa
    const haveValuesChanged =
      lastValidValues === null ||
      Object.keys(dirtyFields).some(
        (key) =>
          watchedValues[key as keyof FormValues] !==
          lastValidValues[key as keyof FormValues]
      );

    if (
      wasPreviouslyValid !== formIsValid ||
      (formIsValid && haveValuesChanged)
    ) {
      if (formIsValid) {
        const currentValues = getValues();
        onValidationChange(row.id, true, currentValues);
        setLastValidValues(currentValues);
      } else {
        onValidationChange(row.id, false);
      }
      setWasPreviouslyValid(formIsValid);
    }
  }, [
    formState,
    watchedValues,
    isValid,
    isClient,
    row.id,
    onValidationChange,
    wasPreviouslyValid,
    getValues,
    dirtyFields,
  ]);

  const handleDocTypeChange = (value: DocType) => {
    setValue("docType", value, { shouldValidate: true });

    // Forzar la validación y actualización
    trigger().then((isValid) => {
      const currentValues = getValues();
      onValidationChange(row.id, isValid, currentValues);
    });
  };
  if (!isClient) return null;

  const handleCityChange = (value: string) => {
    setValue("cityId", value, { shouldValidate: true });

    // Forzar la validación y actualización
    trigger().then((isValid) => {
      const currentValues = getValues();
      onValidationChange(row.id, isValid, currentValues);
    });
  };

  // Determinar si la fila tiene error de API
  const hasApiError = !!apiError;

  return (
    <>
      <TableRow
        className={cn(
          hasApiError && "bg-red-100 hover:bg-red-100 border-none"
        )}
      >
        <TableCell className={cn(hasApiError && "border-red-200")}>
          <input
            {...register("name")}
            className={cn(
              "w-full p-2 border rounded",
              errors.name && "border-red-500",
              hasApiError && "bg-red-50"
            )}
            placeholder="Nombres"
          />
          {errors.name && (
            <span className="text-red-500 text-sm">{errors.name.message}</span>
          )}
        </TableCell>
        <TableCell className={cn(hasApiError && "border-red-200")}>
          <input
            {...register("lastName")}
            className={cn(
              "w-full p-2 border rounded",
              errors.lastName && "border-red-500",
              hasApiError && "bg-red-50"
            )}
            placeholder="Apellidos"
          />
          {errors.lastName && (
            <span className="text-red-500 text-sm">
              {errors.lastName.message}
            </span>
          )}
        </TableCell>
        <TableCell
          className={cn(
            errors.docType && "bg-red-100",
            hasApiError && "border-red-200"
          )}
        >
          <Select
            {...register("docType")}
            value={watchedValues.docType}
            onValueChange={handleDocTypeChange}
          >
            <SelectTrigger
              className={cn(
                errors.docType && "border-red-500",
                hasApiError && "bg-red-50 border-red-300"
              )}
            >
              <SelectValue placeholder="Selecciona el tipo de documento" />
            </SelectTrigger>
            <SelectContent>
              {docTypeOptions.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.docType && (
            <span className="text-red-500 text-sm">
              {errors.docType.message}
            </span>
          )}
          {docType && !watchedValues.docType && (
            <span className="flex gap-2 text-red-500">
              <X className="w-4 h-4" /> Valor no válido: {docType}
            </span>
          )}
        </TableCell>
        <TableCell className={cn(hasApiError && "border-red-200")}>
          <input
            {...register("identificationNumber")}
            className={cn(
              "w-full p-2 border rounded",
              errors.identificationNumber && "border-red-500",
              hasApiError && "bg-red-50"
            )}
            placeholder="# Documento"
          />
          {errors.identificationNumber && (
            <span className="text-red-500 text-sm">
              {errors.identificationNumber.message}
            </span>
          )}
        </TableCell>
        <TableCell className={cn(hasApiError && "border-red-200")}>
          <input
            {...register("email")}
            className={cn(
              "w-full p-2 border rounded",
              errors.email && "border-red-500",
              hasApiError && "bg-red-50"
            )}
            placeholder="sin correo"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email.message}</span>
          )}
        </TableCell>
        <TableCell
          className={cn(
            errors.cityId && "bg-red-100",
            hasApiError && "border-red-200"
          )}
        >
          <Select value={watchedValues.cityId} onValueChange={handleCityChange}>
            <SelectTrigger
              className={cn(
                errors.cityId && "border-red-500",
                hasApiError && "bg-red-50 border-red-300"
              )}
            >
              <SelectValue placeholder="Selecciona un cargo" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.realName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.cityId && (
            <span className="text-red-500 text-sm">
              {errors.cityId.message}
            </span>
          )}
          {watchedValues.cityId === "" && city && (
            <span className="flex gap-2 text-red-500">
              <X className="w-4 h-4" /> {city}
            </span>
          )}
        </TableCell>

        <TableCell className={cn(hasApiError && "border-red-200")}>
          <Button
            variant={"destructive"}
            className="p-1 h-fit"
            onClick={() => deleteCell(row.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </TableCell>
      </TableRow>
      {/* Fila de error de API si existe */}
      {hasApiError && (
        <TableRow className="bg-red-100 hover:bg-red-100 p-0">
          <TableCell
            colSpan={7}
            className="p-0 mt-5 border-red-200 align-bottom"
          >
            <div className="flex items-center gap-2">
              <X className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700 font-medium">Error:</span>
              <span className="text-sm text-red-600">{apiError}</span>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
