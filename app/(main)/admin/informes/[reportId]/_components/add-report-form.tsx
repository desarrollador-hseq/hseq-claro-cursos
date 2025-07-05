"use client";

import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { format } from "date-fns";
import { cn, formatDate } from "@/lib/utils";

import { es } from "date-fns/locale";

import { CheckedState } from "@radix-ui/react-checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { Report } from "@prisma/client";
import axios from "axios";
import {
  CalendarIcon,
  Check,
  ClipboardEditIcon,
  FilePlus,
  Loader2,
  X,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { IconBadge } from "@/components/ui/icon-badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { DeleteReport } from "./delete-report";
import { Input } from "@/components/ui/input";

interface AddReportFormProps {
  report?: Report | null;
}

const formSchema = z.object({
  deliveryDate: z.date().or(z.string()),
  conformity: z.boolean().default(false),
  fileUrl: z.string().optional(),
});

export const AddReportForm = ({ report }: AddReportFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => report, [report]);

  if (isEdit && !report) {
    router.replace("/admin/informes/");
    toast.error("Informe no encontrado, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryDate: report?.deliveryDate || "",
      conformity: report?.conformity || false,
      fileUrl: report?.fileUrl || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const { setValue } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEdit) {
        await axios.patch(`/api/reports/${report?.id}`, values);
        toast.success("informe actualizado");
      } else {
        const { data } = await axios.post(`/api/reports/`, values);
        toast.success("informe registrado");
      }
      router.push(`/admin/informes/`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  };

  const handleEvaluation = (e: CheckedState) => {
    setValue("conformity", !!e, { shouldValidate: true });
  };

  return (
    <div className=" max-w-[1500px] mx-auto bg-white rounded-md shadow-sm overflow-hidden p-3">
      <div className="flex justify-between items-center gap-x-2 bg-white">
        <div className="flex items-center">
          <IconBadge icon={isEdit ? ClipboardEditIcon : FilePlus} />
          <h2 className="text-2xl font-semibold">
            {isEdit ? (
              <p>
                Editar Informe:{" "}
                <span className="font-normal">
                  {formatDate(report?.deliveryDate!)}
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
          className="flex flex-col items-center mt-8 p-2"
        >
          <div className="grid grid-cols-1  gap-6 mt-1 mb-7 w-full max-w-[900px]">
            <div className="space-y-8 ">
              <div>
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de ejecución</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-slate-100 hover:bg-slate-200",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(
                                  new Date(field.value),
                                  "dd 'de' LLLL 'de' y",
                                  { locale: es }
                                )
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(field.value)}
                            onSelect={field.onChange}
                            // disabled={(date) =>
                            //   date > new Date() || date < new Date("1900-01-01")
                            // }
                            initialFocus
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEdit && (
                <div>
                  <FormField
                    control={form.control}
                    name="conformity"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel
                          className="font-bold"
                          htmlFor="evaluationPass"
                        >
                          ¿Conformidad?
                        </FormLabel>
                        <div
                          // onClick={() => handleEvaluation(!!!field.value)}
                          className={cn(
                            "w-full h-11 flex gap-3 justify-between items-center bg-slate-100 space-y-0 rounded-md border p-4 hover:cursor-pointer",
                            field.value && "bg-green-600"
                          )}
                        >
                          <div className="flex gap-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                // onCheckedChange={field.onChange}
                                onCheckedChange={(e) => handleEvaluation(e)}
                                className={cn("")}
                              />
                            </FormControl>
                            <span className={cn("font-bold", field.value && "text-white")}>
                              {field.value ? "Sí" : "No"}
                            </span>
                          </div>
                          <div className=" space-y-1 leading-none flex justify-between">
                            <FormDescription
                              className={`${field.value && "text-white"}`}
                            >
                              {!field.value ? (
                                <span className="w-full flex gap-3 justify-between">
                                  {" "}
                                  sin conformidad
                                  <X className="w-5 h-5 text-red-400" />{" "}
                                </span>
                              ) : (
                                <span className="w-full flex gap-3 justify-between">
                                  informe aceptado
                                  <Check className="w-5 h-5" />{" "}
                                </span>
                              )}
                            </FormDescription>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div>
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold" htmlFor="fileUrl">
                        Link
                      </FormLabel>
                      <FormControl>
                        <Input id="fileUrl" disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage className="ml-6 text-[0.8rem] text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>
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
