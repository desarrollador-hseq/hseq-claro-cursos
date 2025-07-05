"use client";

import { useRouter } from "next/navigation";
import React, { LegacyRef, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { es } from "date-fns/locale";

import { zodResolver } from "@hookform/resolvers/zod";
import { MonthlyReports, Report } from "@prisma/client";
import axios from "axios";
import {
  ClipboardEditIcon,
  Cloud,
  File,
  FilePlus,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { useDropzone } from "react-dropzone";

import { Separator } from "@/components/ui/separator";
import { IconBadge } from "@/components/ui/icon-badge";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Progress } from "@/components/ui/progress";
// import { DeleteReport } from "./delete-report";

interface AddReportFormProps {
  monthlyReport?: MonthlyReports | null;
}

const MAX_FILE_SIZE = 1024 * 1024 * 1;
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

export const AddMonthReportForm = ({ monthlyReport }: AddReportFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => monthlyReport, [monthlyReport]);
  const [isUploading, setIsUploading] = useState<boolean | null>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressInterval, setProgressInterval] = useState<any | null>();
  const [startDate, setStartDate] = useState<Date | null>(
    monthlyReport ? monthlyReport.date : new Date()
  );
  const ref = useRef<LegacyRef<Date | null>>();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const formSchema = z.object({
    date: z.date(),
    file: z
      .any()
      .or(z.string())
      .refine((file) => file?.length !== 0, "File is required")
      .refine((files) => {
        return files?.size <= MAX_FILE_SIZE;
      }, `El tamaño maximo del archivo es de 1MB.`)
      .refine(
        (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.type),
        "Solo los formtatos de .jpg, .jpeg, .png, y .pdf son aceptados"
      )
      .nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: monthlyReport?.date || new Date(),
      file: null,
    } as any,
  });
  if (isEdit && !monthlyReport) {
    router.replace("/admin/informes/");
    toast.error("Informe no encontrado, redirigiendo...");
  }

  const { isSubmitting, isValid } = form.formState;
  const { setValue } = form;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".svg"],
      "application/pdf": [".pdf"],
    },
  });

  useEffect(() => {
    if (isEdit && selectedFile) {
      setValue("file", selectedFile, { shouldValidate: true });
    }
  }, [selectedFile]);
  useEffect(() => {
    if (startDate) {
      setValue("date", startDate, { shouldValidate: true });
    }
  }, [startDate]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEdit) {
        await axios.patch(`/api/monthly-report/${monthlyReport?.id}`, values);
        toast.success("informe actualizado");
      } else {
        setIsUploading(true);
        const progressInterval = startSimulatedProgress();
        const formData = new FormData();

        formData.append("file", values.file);
        formData.append("field", "reportUrl");
        formData.append("ubiPath", "informes/mensuales");
        let mreport: MonthlyReports | null = null;
        try {
          const { data } = await axios.post(`/api/monthly-report/`, {
            date: values.date,
          });
          mreport = data;
        } catch (error) {
          toast.error("Error al crear el informe");
        }

        try {
          if (mreport) {
            await axios.post(
              `/api/monthly-report/${mreport.id}/upload`,
              formData
            );
          }
        } catch (error) {
          console.log("error al subir el archivo a la nube", error);
        } finally {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setIsUploading(false);
        }

        toast.success("informe mensual registrado");
      }
      router.push(`/admin/informes/`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  };

  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval);
          return prevProgress;
        }
        return prevProgress + 5;
      });
    }, 500);

    return interval;
  };

  return (
    <div className=" max-w-[1500px] mx-auto bg-white rounded-md shadow-sm overflow-hidden p-3">
      <div className="flex justify-between items-center gap-x-2 bg-white">
        <div className="flex items-center">
          <IconBadge icon={isEdit ? ClipboardEditIcon : FilePlus} />
          <h2 className="text-2xl font-semibold">
            {isEdit ? (
              <p>
                Editar Informe mensual:{" "}
                <span className="font-normal">
                  {monthlyReport &&
                    format(new Date(monthlyReport.date), "MMMM", {
                      locale: es,
                    })}
                </span>
              </p>
            ) : (
              "Registrar informe"
            )}
          </h2>
        </div>
        {/* {isEdit && <DeleteReport report={report!} />} */}
      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center mt-8 p-2 "
        >
          <div
            className={cn(
              `grid grid-cols-1 ${
                isEdit ? "md:grid-cols-1" : "md:grid-cols-2"
              }  gap-6 mt-1 mb-7 w-full max-w-[900px]`
            )}
          >
            <div className="place-self-center">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="MMM y"
                showMonthYearPicker
                inline
                locale={es}
              />
            </div>

            {!isEdit && (
              <div
                {...getRootProps()}
                className={"dropzone w-full focus:border-red-600"}
              >
                <div
                  className={cn(
                    "flex flex-col items-center justify-center pt-5 pb-6 mb-3 max-w-full"
                  )}
                >
                  {uploadProgress !== 100 ? (
                    <div className="flex flex-col gap-3 items-center">
                      <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                      <p className="mb-2 text-sm text-zinc-700">
                        <span className="font-semibold">Click para subir</span>{" "}
                        o arrastra el archivo aquí
                      </p>
                      <p className="text-xs text-zinc-500">
                        Formatos aceptados: jpg, jpeg, png y pdf
                      </p>
                      {selectedFile ? (
                        <div className="flex max-w-xs bg-white items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                          <div className="px-3 py-2 h-full grid place-items-center">
                            <File className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="px-3 py-2 h-full text-sm truncate">
                            {selectedFile.name}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      <p className="mb-2 text-sm font-semibold flex flex-col items-center text-emerald-500">
                        <UploadCloud className="w-16 h-16 " />
                        Archivo subido correctamente
                      </p>
                    </>
                  )}
                </div>

                {!!uploadProgress && (
                  <Progress
                    indicatorColor={
                      uploadProgress === 100 ? "bg-green-500" : ""
                    }
                    value={uploadProgress}
                    className="h-1 w-full bg-zinc-200"
                  />
                )}

                <input {...getInputProps()} />
                {!selectedFile && isDragActive && (
                  <p>Haga clic o arrastre un archivo para cargarlo</p>
                )}
              </div>
            )}
          </div>

          <Button
            disabled={isSubmitting || !isValid}
            className="w-full max-w-[500px] gap-3"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEdit ? "Actualizar" : "Crear"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
