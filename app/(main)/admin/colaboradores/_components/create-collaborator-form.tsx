"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { City, Collaborator } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { IconBadge } from "@/components/ui/icon-badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteCollaborator } from "../[collaboratorId]/_components/delete-collaborator";
import { DocumentInputForm } from "@/components/document-input-form";
import { LoadingButton } from "@/components/ui/loading-button";

interface AddCollaboratorFormProps {
  collaborator?: Collaborator | null;
  cities: City[];
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Nombre requerido",
  }),
  lastname: z.string().min(1, {
    message: "Apellido requerido",
  }),
  numDoc: z.string().min(1, {
    message: "Número de documento requerido",
  }),
  cityId: z.string().min(1, "Seleccione una ciudad"),
  docType: z.string().min(1, "Seleccione un tipo de documento"),
  // evaluationPass: z.boolean().default(false),
});

export const CreateCollaboratorForm = ({
  collaborator,
  cities,
}: AddCollaboratorFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => collaborator, [collaborator]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  if (isEdit && !collaborator) {
    router.replace("/admin/colaboradores/");
    toast.error("Colaborador no encontrado, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: collaborator?.name || "",
      lastname: collaborator?.lastname || "",
      numDoc: collaborator?.numDoc
        ? new Intl.NumberFormat("es-ES").format(
            Number(collaborator.numDoc.toString().replace(/\./g, ""))
          )
        : "",
      docType: collaborator?.docType || "CC",
      cityId: collaborator?.cityId || "",
      // startDate: collaborator?.startDate || undefined,
      // endDate: collaborator?.endDate || undefined,
      // percentage: collaborator?.percentage || 0,
      // certificateUrl: collaborator?.certificateUrl || undefined,
      // isVirtual: collaborator?.isVirtual || undefined,
      // byArl: collaborator?.byArl || undefined,
      // evaluationPass: !!collaborator?.evaluationPass || false,
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const { setValue, setError } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, lastname, numDoc, ...valuesRes } = values;
    const nameClean = name.trim();
    const lastnameClean = lastname.trim();
    const numDocClean = numDoc.replaceAll(".", "").trim();
    setValue("name", nameClean, { shouldValidate: true });
    setValue("lastname", lastnameClean, { shouldValidate: true });
    setValue("numDoc", numDocClean, { shouldValidate: true });
    try {
      if (isEdit) {
        await axios.patch(`/api/collaborators/${collaborator?.id}`, {
          ...valuesRes,
          name: nameClean,
          lastname: lastnameClean,
          numDoc: numDocClean,
        });
        toast.success("Colaborador actualizado");
      } else {
        const { data } = await axios.post(`/api/collaborators/`, values);
        router.push(`/admin/colaboradores/${data.id}`);
        toast.success("Colaborador creado");
      }
      // router.push(`/admin/colaboradores`);
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverResponse = error.response;
        if (serverResponse && serverResponse.status === 400) {
          const errorMessage = serverResponse.data;
          if (
            typeof errorMessage === "string" &&
            errorMessage.includes("Número de documento ya registrado")
          ) {
            setError("numDoc", {
              type: "manual",
              message: "Número de documento ya registrado",
            });
          } else {
            toast.error(errorMessage);
          }
        } else {
          toast.error("Ocurrió un error inesperado");
        }
      } else {
        console.error(error);
        toast.error("Ocurrió un error inesperado");
      }
    }
  };

  const handleCityChange = (event: string) => {
    const selectedCityId = event;
    setValue("cityId", selectedCityId, { shouldValidate: true });
  };

  return (
    <div className="max-w-[1500px] h-full mx-auto bg-white rounded-md shadow-sm overflow-y-hidden p-3 ">
      <div className="flex justify-end items-center gap-x-2 bg-white">
        {isEdit && <DeleteCollaborator collaborator={collaborator!} />}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center mt-1 p-2 max-w-[500px] mx-auto"
        >
          <div className="grid grid-cols-1 gap-6 mt-1 mb-7 w-full">
            <div className="space-y-4">
              <div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold" htmlFor="name">
                        Nombre
                      </FormLabel>

                      <FormControl>
                        <Input
                          id="name"
                          disabled={isSubmitting}
                          className="text-lg font-semibold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="ml-6 text-[0.8rem] text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="lastname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold" htmlFor="lastname">
                        Apellido
                      </FormLabel>

                      <FormControl>
                        <Input
                          id="lastname"
                          disabled={isSubmitting}
                          className="text-lg font-semibold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="ml-6 text-[0.8rem] text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <DocumentInputForm
                  // control={form.control}
                  label="Identificación"
                  typeFieldName="docType"
                  numberFieldName="numDoc"
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="cityId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <Select
                        onValueChange={(e) => handleCityChange(e)}
                        defaultValue={
                          field.value ? field.value.toString() : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-100 border-slate-300 text-lg font-semibold">
                            <SelectValue
                              className="text-red-500"
                              placeholder="Selecciona la ciudad del colaborador"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem
                              key={city.id}
                              value={city.id.toString()}
                              className="text-lg font-semibold"
                            >
                              {city.realName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="ml-6 text-[0.8rem] text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <LoadingButton
            disabled={isSubmitting || !isValid}
            className="w-full max-w-[500px] gap-3"
            loading={isSubmitting}
          >
            {isEdit ? "Actualizar" : "Crear"}
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
};
