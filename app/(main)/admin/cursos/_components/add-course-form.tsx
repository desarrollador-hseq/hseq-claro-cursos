"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Course } from "@prisma/client";
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

import { DeleteCourse } from "./delete-course";

interface AddCollaboratorFormProps {
  course?: Course | null;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Nombre requerido",
  }),
  resolution: z.string().optional(),
});

export const AddCourseForm = ({ course }: AddCollaboratorFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => course, [course]);

  if (isEdit && !course) {
    router.replace("/admin/colaboradores/");
    toast.error("Colaborador no encontrado, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course?.name || "",
      resolution: course?.resolution || "",
    },
  });
  const { isSubmitting, isValid } = form.formState;
  const { setValue, setError } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, resolution, ...valuesRes } = values;
    const nameClean = name.trim();
    const resolutionClean = resolution?.replaceAll(".", "").trim() || "";
    setValue("name", nameClean, { shouldValidate: true });
    setValue("resolution", resolutionClean, { shouldValidate: true });
    try {
      if (isEdit) {
        await axios.patch(`/api/courses/${course?.id}`, {
          ...valuesRes,
          name: nameClean,
          resolution: resolutionClean,
        });
        toast.success("Curso actualizado");
      } else {
        const { data } = await axios.post(`/api/courses/`, values);
        router.push(`/admin/cursos/editar/${data.id}`);
        toast.success("Curso creado");
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
              message: "Curso ya registrado",
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

  return (
    <div className="max-w-[1500px] h-full mx-auto bg-white rounded-md shadow-sm overflow-y-hidden p-3 ">
      <div className="flex justify-end items-center gap-x-2 bg-white">
        {isEdit && <DeleteCourse course={course!} />}
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
            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold" htmlFor="fullName">
                    Resolución
                  </FormLabel>

                  <FormControl>
                    <Input
                      id="resolution"
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
