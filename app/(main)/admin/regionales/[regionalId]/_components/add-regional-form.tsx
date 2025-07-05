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
import { Input } from "@/components/ui/input";
import { DeleteRegional } from "./delete-regional";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingButton } from "@/components/ui/loading-button";
// import { DeleteCity } from "./delete-city";

interface RegionalWithCity extends Regional {
  cities: City[] | null;
}

interface AddRegionalFormProps {
  regional?: RegionalWithCity | null | undefined;
}

const formSchema = z.object({
  name: z.string().min(1, "Ingrese el nombre de la regional"),
});

export const AddRegionalForm = ({ regional }: AddRegionalFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => regional, [regional]);

  if (isEdit && !regional) {
    router.replace("/admin/ciudades");
    toast.error("Regional no encontrada, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: regional?.name || undefined,
    },
  });
  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEdit) {
        await axios.patch(`/api/regional/${regional?.id}`, values);
      } else {
        const { data } = await axios.post(`/api/regional/`, values);
        toast.success("Ciudad actualizada");
      }
      router.push(`/admin/ciudades/`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  };

  return (
    <Card className=" max-w-[1500px] mx-auto shadow-sm bg-white overflow-hidden p-3 rounded-sm">
      <CardHeader className="flex gap-x-1 bg-white">
        <div className="flex items-center">
          <IconBadge icon={isEdit ? ClipboardList : Clipboard} />
          <h2 className="text-2xl font-semibold">
            {isEdit ? (
              <>
                <p>
                  Editar Regional:
                  <span className="text-base ml-3 font-semibold">
                    <span className="capitalize">{regional?.name}</span>
                  </span>
                </p>
              </>
            ) : (
              "Registrar Regional"
            )}
          </h2>
        </div>
        <div>{isEdit && <DeleteRegional regional={regional!} />}</div>
        <Separator />
      </CardHeader>

      <CardContent>
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
                    name="name"
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
              </div>
            </div>

            <LoadingButton
              disabled={isSubmitting || !isValid}
              loading={isSubmitting}
              className="w-full max-w-[500px] gap-3"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Actualizar" : "Crear"}
            </LoadingButton>
          </form>
        </Form>

        {regional?.cities && (
          <div className="w-[300px] mt-8">
            <h2 className="text-xl font-bold text-center">
              Ciudades relacionas
            </h2>
            <div>
              {regional?.cities?.map((reg) => (
                <div
                  key={reg.id}
                  className="border border-r-primary-100 border-l-primary-100 border-t-primary-100 p-2 flex justify-center"
                >
                  {reg.realName}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
