"use client";

import React, { useEffect, useState } from "react";
import { Trash, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";


// Esquema de validación con Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Mínimo 2 caracteres" }),
  lastName: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  identificationNumber: z.string().min(7, { message: "Mínimo 7 caracteres" }),
});

type FormValues = z.infer<typeof formSchema>;

export const EmployeeValidationDataRow = ({
  row,
  deleteCell,
  onValidationChange,
}: {
  row: any;
  deleteCell: (i: string) => void;
  onValidationChange: (
    id: string,
    isValid: boolean,
    formData?: FormValues
  ) => void;
}) => {
  const { name, lastName, identificationNumber } = row;

  const [isClient, setIsClient] = useState<boolean>(false);
  const [wasPreviouslyValid, setWasPreviouslyValid] = useState<boolean | null>(
    null
  );
  const [lastValidValues, setLastValidValues] = useState<FormValues | null>(
    null
  );
  // Utiliza formState.isValid para una validación más confiable

  // Encontrar IDs iniciales

  // Formulario con react-hook-form y Zod
  const {
    register,
    formState,
    watch,
    setValue,
    getValues,
    control,
    trigger,
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || "",
      lastName: lastName || "",
      identificationNumber: identificationNumber || "",
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

  if (!isClient) return null;

  return (
    <TableRow>
      <TableCell>
        <input
          {...register("name")}
          className={cn(
            "w-full p-2 border rounded",
            errors.name && "border-red-500"
          )}
          placeholder="Nombres"
        />
        {errors.name && (
          <span className="text-red-500 text-sm">{errors.name.message}</span>
        )}
      </TableCell>
      <TableCell>
        <input
          {...register("lastName")}
          className={cn(
            "w-full p-2 border rounded",
            errors.lastName && "border-red-500"
          )}
          placeholder="Apellidos"
        />
        {errors.lastName && (
          <span className="text-red-500 text-sm">
            {errors.lastName.message}
          </span>
        )}
      </TableCell>
      <TableCell>
        <input
          {...register("identificationNumber")}
          className={cn(
            "w-full p-2 border rounded",
            errors.identificationNumber && "border-red-500"
          )}
          placeholder="# Documento"
        />
        {errors.identificationNumber && (
          <span className="text-red-500 text-sm">
            {errors.identificationNumber.message}
          </span>
        )}
      </TableCell>

      <TableCell>
        <Button
          variant={"destructive"}
          className="p-1 h-fit"
          onClick={() => deleteCell(row.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
