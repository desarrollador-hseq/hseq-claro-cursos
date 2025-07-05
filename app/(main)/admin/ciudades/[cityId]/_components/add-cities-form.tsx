"use client";

import axios from "axios";
import { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { City, Regional } from "@prisma/client";
import { Clipboard, ClipboardList, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconBadge } from "@/components/ui/icon-badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DeleteCity } from "./delete-city";

interface CityWithRegional extends City {
  regional: Regional | null;
}

interface AddInspectionFormProps {
  city?: CityWithRegional;
  regional: Regional[];
}

const formSchema = z.object({
  regionalId: z.string(),
  realName: z.string().min(1, "Ingrese el nombre de la ciudad"),
});

export const AddCityForm = ({ city, regional }: AddInspectionFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => city, [city]);

  if (isEdit && !city) {
    router.replace("/admin/ciudades");
    toast.error("Ciudad no encontrada, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      regionalId: city?.regional?.id || undefined,
      realName: city?.realName || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const { setValue } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formated = values.realName.trim().replace(" ", "-").toLowerCase();
      if (isEdit) {
        await axios.patch(`/api/cities/${city?.id}`, { formated, ...values });
      } else {
        const { data } = await axios.post(`/api/cities/`, {
          formated,
          ...values,
        });
        toast.success("Ciudad actualizada");
      }
      router.push(`/admin/ciudades/`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  };

  const handleRegionalChange = (event: string) => {
    const selectedCityId = event;
    setValue("regionalId", selectedCityId, { shouldValidate: true });
  };

  return (
    <div className=" max-w-[1500px] mx-auto shadow-sm bg-white overflow-hidden p-3">
      <div className="flex justify-between items-center gap-x-2 bg-white">
        <div className="flex items-center">
          <IconBadge icon={isEdit ? ClipboardList : Clipboard} />
          <h2 className="text-2xl font-semibold">
            {isEdit ? (
              <>
                <p>
                  Editar Ciudad:
                  <span className="text-base ml-3 font-semibold">
                    <span className="capitalize">{city?.realName}</span>
                  </span>
                </p>
              </>
            ) : (
              "Registrar ciudad"
            )}
          </h2>
        </div>
        <div>{isEdit && <DeleteCity city={city!} />}</div> 

      </div>
      <Separator />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center mt-8 px-2"
        >
          <div className="grid grid-cols-1  gap-6 mt-1 mb-7 w-full max-w-[900px]">
            <div className="space-y-8 ">
              <div>
                <FormField
                  control={form.control}
                  name="realName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold" htmlFor="lastname">
                        Nombre
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="lastname"
                          disabled={isSubmitting}
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
                  name="regionalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Regional</FormLabel>
                      <Select
                        onValueChange={(e) => handleRegionalChange(e)}
                        defaultValue={
                          field.value ? field.value.toString() : undefined
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="bg-slate-100 border-slate-300">
                            <SelectValue
                              className="text-red-500"
                              placeholder="Selecciona regional de la ciudad"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regional.map((city) => (
                            <SelectItem
                              key={city.id}
                              value={city.id.toString()}
                            >
                              {city.name}
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
