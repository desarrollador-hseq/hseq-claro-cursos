"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cetar, City, Course } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";

// import { DeleteCourse } from "./delete-course";

interface AddCetarFormProps {
  cetar?: Cetar | null;
  cities: City[];
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Nombre requerido",
  }),
  cityId: z.string().min(1, {
    message: "Ciudad requerida",
  }),
});

export const AddCetarForm = ({ cetar, cities }: AddCetarFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => cetar, [cetar]);

  if (isEdit && !cetar) {
    router.replace("/admin/cetar/");
    toast.error("CETAR no encontrado, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: cetar?.name || "",
      cityId: cetar?.cityId || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const { setValue, setError } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, ...valuesRes } = values;
    const nameClean = name.trim();

    try {
      if (isEdit) {
        await axios.patch(`/api/cetar/${cetar?.id}`, {
          ...valuesRes,
          name: nameClean,
        });
        toast.success("CETAR actualizado");
      } else {
        const { data } = await axios.post(`/api/cetar/`, values);
        router.push(`/admin/cetar/editar/${data.id}`);
        toast.success("CETAR creado");
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
            errorMessage.includes("Curso ya registrado")
          ) {
            setError("name", {
              type: "manual",
              message: "CETAR ya registrado",
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
    setValue("cityId", event, { shouldValidate: true });
  };

  return (
    <div className="max-w-[1500px] h-full mx-auto bg-white rounded-md shadow-sm overflow-y-hidden p-3 ">
      <div className="flex justify-end items-center gap-x-2 bg-white">
        {/* {isEdit && <DeleteCourse course={course!} />} */}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center mt-2 p-2 max-w-[500px] mx-auto"
        >
          <div className="grid grid-cols-1 gap-6 mt-1 mb-7 w-full">
            <div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold" htmlFor="fullName">
                      Nombre del curso
                    </FormLabel>

                    <FormControl>
                      <Input
                        id="fullName"
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

          <LoadingButton
            disabled={isSubmitting || !isValid}
            loading={isSubmitting}
            className="w-full max-w-[500px] gap-3"
          >
            {isEdit ? "Actualizar" : "Crear"}
          </LoadingButton>
        </form>
      </Form>
    </div>
  );
};
