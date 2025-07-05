"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { FileText, Plus, Pencil, Save } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SimpleModal } from "@/components/simple-modal";
import { Input } from "@/components/ui/input";
import { CourseLevel, RequiredDocument } from "@prisma/client";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";

interface AddDocumentRequiredFormProps {
  requiredDocument?:
    | { id: string | null; name: string | null }
    | null
    | undefined;
  courseLevel: CourseLevel & { requiredDocuments: RequiredDocument[] };
  canManagePermissions: boolean;
  courseId: string;
  documents?: RequiredDocument[];
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "El nombre del documento es requerido",
    })
    .max(100, {
      message: "El nombre no puede exceder 100 caracteres",
    }),
});

export const HandleRequiredDocument = ({
  requiredDocument,
  documents,
  courseLevel,
  courseId,
  canManagePermissions,
}: AddDocumentRequiredFormProps) => {
  const router = useRouter();

  const isEdit = useMemo(() => requiredDocument, [requiredDocument]);
  const [close, setClose] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: requiredDocument?.name || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!canManagePermissions) {
      toast.error("Sin permisos para proceder");
      return;
    }

    try {
      if (!isEdit) {
        await axios.post(
          `/api/courses/${courseId}/course-levels/${courseLevel?.id}/required-document`,
          values
        );
        toast.success("Documento requerido creado");
      } else {
        await axios.patch(
          `/api/courses/${courseId}/course-levels/${courseLevel?.id}/required-document/${requiredDocument?.id}`,
          values
        );
        toast.success("Documento requerido actualizado");
      }

      setClose(true);
      router.refresh();
      form.reset();
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data && error.response?.status === 400) {
          if (error.response?.data === "Required document already exists") {
            toast.error("El documento requerido ya existe");
          }
        }
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    }
  };

  const buttonText = isEdit ? (
    <div className="flex items-center gap-2">
      <Pencil className="h-3 w-3" />
      Editar
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Agregar Documento
    </div>
  );

  const modalTitle = isEdit
    ? "Editar Documento Requerido"
    : "Nuevo Documento Requerido";

  return (
    <SimpleModal
      title={modalTitle}
      textBtn={buttonText}
      close={close}
      setClose={setClose}
    >
      <div className="mt-6">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
              <FileText className="h-5 w-5 text-blue-600" />
              {isEdit ? "Modificar información" : "Información del documento"}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {isEdit
                ? "Actualiza el nombre del documento requerido"
                : `Agrega un nuevo documento requerido para el nivel "${courseLevel?.name}"`}
            </p>
          </CardHeader>
          <CardContent className="px-0">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 font-semibold text-gray-700">
                        <FileText className="h-4 w-4" />
                        Nombre del documento
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: Certificado médico, Cédula de ciudadanía..."
                          disabled={isSubmitting}
                          className="transition-all focus:ring-2 focus:ring-blue-500 border-gray-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">
                        Ingresa el nombre del documento que será requerido para
                        este nivel
                      </p>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setClose(true)}
                    disabled={isSubmitting}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <LoadingButton
                    type="submit"
                    disabled={!isValid || isSubmitting || !canManagePermissions}
                    loading={isSubmitting}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? "Actualizar" : "Guardar"}
                  </LoadingButton>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SimpleModal>
  );
};
