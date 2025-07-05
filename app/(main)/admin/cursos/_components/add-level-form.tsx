"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Course, CourseLevel, RequiredDocument } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Book,
  Clock,
  FileText,
  Pencil,
  PlusCircle,
  Trash2,
  Users,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { SimpleModal } from "@/components/simple-modal";
import { HandleRequiredDocument } from "../handle-required-document";

interface AddCourseLevelFormProps {
  courseLevel?:
    | (CourseLevel & { requiredDocuments: RequiredDocument[] })
    | null;
  course?: Course | null;
  canManagePermissions: boolean;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Nombre del curso es requerido",
  }),
  hours: z.coerce.number().min(1, {
    message: "Las horas deben ser mayor a 0",
  }),
  monthsToExpire: z.coerce.number().min(0, {
    message: "Los meses deben ser 0 o mayor",
  }),
});

export const AddLevelForm = ({
  courseLevel,
  course,
  canManagePermissions,
  onSuccess,
}: AddCourseLevelFormProps) => {
  const router = useRouter();
  const isLevel = useMemo(() => courseLevel !== null, [courseLevel]);
  const isEdit = useMemo(() => isLevel && courseLevel, [courseLevel, isLevel]);
  const [modalClose, setModalClose] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: courseLevel?.name || "",
      hours: courseLevel?.hours || undefined,
      monthsToExpire: courseLevel?.monthsToExpire || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!canManagePermissions) {
      toast.error("Sin permisos para proceder");
      return;
    }

    try {
      if (isEdit) {
        await axios.patch(
          `/api/courses/${course?.id}/course-levels/${courseLevel?.id}`,
          values
        );
        toast.success("Nivel actualizado correctamente");
      } else {
        await axios.post(`/api/courses/${course?.id}/course-levels`, values);
        toast.success("Nivel creado correctamente");
      }

      setModalClose(true);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado");
    }
  };

  const onDeleteDocument = async (requiredDocumentId: string) => {
    if (!canManagePermissions) {
      toast.error("Sin permisos para proceder");
      return;
    }

    try {
      await axios.delete(
        `/api/courses/${course?.id}/course-levels/${courseLevel?.id}/required-document/${requiredDocumentId}`
      );
      toast.success("Documento requerido eliminado");
      router.refresh();
    } catch {
      toast.error("Ocurrió un error inesperado");
    }
  };

  return (
    <SimpleModal
      close={modalClose}
      setClose={setModalClose}
      title={
        isEdit
          ? `Editar nivel de ${course?.name}`
          : `Nuevo nivel para ${course?.name}`
      }
      textBtn={
        <div className="flex items-center gap-2">
          {isEdit ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <PlusCircle className="h-4 w-4" />
          )}
          {isEdit ? "Editar nivel" : "Agregar nivel"}
        </div>
      }
      large
    >
      <div className="space-y-6 mt-1">
        {/* Información del curso */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Book className="h-5 w-5" />
              Curso: {course?.name}
            </CardTitle>
            {course?.shortName && (
              <CardDescription className="text-blue-700">
                {course.shortName}
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        <div className={`grid gap-6 ${isEdit ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
          {/* Formulario del nivel */}
          <Card className="lg:max-w-[500px] mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {isEdit ? "Editar Información" : "Información del Nivel"}
              </CardTitle>
              <CardDescription>
                {isEdit
                  ? "Modifica los datos del nivel del curso"
                  : "Completa la información básica del nuevo nivel"}
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <FormLabel className="flex items-center gap-2 font-semibold">
                          <FileText className="h-4 w-4" />
                          Nombre del nivel
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej: Básico, Intermedio, Avanzado"
                            disabled={isSubmitting}
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="hours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <Clock className="h-4 w-4" />
                            Horas de duración
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="0"
                              disabled={isSubmitting}
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="monthsToExpire"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 font-semibold">
                            <Users className="h-4 w-4" />
                            Meses para reentrenamiento
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              disabled={isSubmitting}
                              className="transition-all focus:ring-2 focus:ring-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <LoadingButton
                    type="submit"
                    disabled={isSubmitting || !isValid || !canManagePermissions}
                    className="w-full "
                    loading={isSubmitting}
                  >
                    {isEdit ? "Actualizar Nivel" : "Crear Nivel"}
                  </LoadingButton>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Documentos requeridos */}
          {isEdit && courseLevel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Requeridos
                  <Badge variant="secondary" className="ml-auto">
                    {courseLevel.requiredDocuments?.length || 0}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Gestiona los documentos necesarios para este nivel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <HandleRequiredDocument
                  courseId={course?.id!}
                  courseLevel={courseLevel}
                  canManagePermissions={canManagePermissions}
                />

                {courseLevel?.requiredDocuments &&
                courseLevel.requiredDocuments.length > 0 ? (
                  <div className="space-y-3 mt-4">
                    {courseLevel.requiredDocuments.map((document, index) => (
                      <div
                        key={document.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">
                            {document.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <HandleRequiredDocument
                            courseId={course?.id || ""}
                            courseLevel={courseLevel}
                            canManagePermissions={canManagePermissions}
                            requiredDocument={document}
                          />
                          <SimpleModal
                            textBtn={<Trash2 className="h-4 w-4" />}
                            title={
                              <div className="flex items-center gap-2 w-full justify-center">
                                <Trash2 className="h-4 w-4" />
                                Eliminar documento requerido
                              </div>
                            }
                            onAccept={() => onDeleteDocument(document.id)}
                            close={modalClose}
                            setClose={setModalClose}
                          >
                            <p className="text-sm">
                              ¿Estás seguro de querer eliminar el documento
                              requerido de nomrbre{" "}
                              <span className="font-semibold ">
                                {document.name}
                              </span>
                              ?
                            </p>
                          </SimpleModal>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No hay documentos requeridos</p>
                    <p className="text-xs">
                      Agrega documentos usando el botón superior
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SimpleModal>
  );
};
