"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { FileText, ExternalLink, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Badge } from "@/components/ui/badge";

interface ExternalCertificateDialogProps {
  trainingId: string;
  collaboratorId: string;
  collaboratorName: string;
  currentUrl?: string | null;
  trigger: React.ReactNode;
}

const formSchema = z.object({
  url: z
    .string()
    .min(1, "La URL es requerida")
    .url("Debe ser una URL válida")
    // .refine((url) => {
    //   // Validar que sea una URL de archivo común
    //   const validExtensions = [
    //     ".pdf",
    //     ".doc",
    //     ".docx",
    //     ".jpg",
    //     ".jpeg",
    //     ".png",
    //   ];
    //   const lowercaseUrl = url.toLowerCase();
    //   return (
    //     validExtensions.some((ext) => lowercaseUrl.includes(ext)) ||
    //     lowercaseUrl.includes("drive.google.com") ||
    //     lowercaseUrl.includes("dropbox.com") ||
    //     lowercaseUrl.includes("onedrive.com")
    //   );
    // }, "La URL debe apuntar a un archivo válido o servicio de almacenamiento"),
});

export const ExternalCertificateDialog = ({
  trainingId,
  collaboratorId,
  collaboratorName,
  currentUrl,
  trigger,
}: ExternalCertificateDialogProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: currentUrl || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Siempre intentar POST primero, la API se encargará de actualizar si ya existe
      await axios.post(
        `/api/trainings/${trainingId}/collaborators/${collaboratorId}/cetar-certificate`,
        { certificateUrl: values.url }
      );

      toast.success("Certificado CETAR guardado exitosamente");
      setIsOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("[CETAR_CERTIFICATE_ERROR]", error);
      if (axios.isAxiosError(error)) {
        // Si existe certificado con URL, intentar PATCH
        if (error.response?.status === 409 && currentUrl) {
          try {
            await axios.patch(
              `/api/trainings/${trainingId}/collaborators/${collaboratorId}/cetar-certificate`,
              { certificateUrl: values.url }
            );
            toast.success("Certificado CETAR actualizado exitosamente");
            setIsOpen(false);
            form.reset();
            router.refresh();
            return;
          } catch (patchError) {
            console.error("[CETAR_CERTIFICATE_PATCH_ERROR]", patchError);
          }
        }
        toast.error(error.response?.data?.message || "Error al guardar el certificado CETAR");
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    }
  };

  const handleRemove = async () => {
    try {
      // En lugar de eliminar, actualizar para limpiar la URL
      await axios.patch(
        `/api/trainings/${trainingId}/collaborators/${collaboratorId}/cetar-certificate`,
        { certificateUrl: "" }
      );

      toast.success("URL del certificado CETAR eliminada");
      setIsOpen(false);
      form.reset({ url: "" });
      router.refresh();
    } catch (error) {
      console.error("[CETAR_CERTIFICATE_REMOVE_ERROR]", error);
      toast.error("Error al eliminar la URL del certificado CETAR");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Certificado Externo - CETAR
          </DialogTitle>
          <DialogDescription>
            Añadir URL del certificado externo para{" "}
            <span className="font-semibold">{collaboratorName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información sobre CETAR */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800">
              <Upload className="h-4 w-4" />
              <span className="font-medium">Capacitación CETAR</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Para capacitaciones CETAR, puedes proporcionar el enlace directo
              al certificado.
            </p>
          </div>

          {/* Estado actual */}
          {currentUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    URL Actual:
                  </p>
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate block max-w-[300px]"
                  >
                    {currentUrl}
                  </a>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Activo
                </Badge>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del Certificado</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://ejemplo.com/certificado.pdf"
                        {...field}
                        className="transition-all focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription>
                      Enlace directo al certificado. Admite PDF, imágenes,
                      Google Drive, Dropbox, OneDrive, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between gap-3">
                <div className="space-x-2">
                  {currentUrl && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleRemove}
                      disabled={isSubmitting}
                    >
                      Eliminar URL
                    </Button>
                  )}
                </div>

                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <LoadingButton
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    loading={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {currentUrl ? "Actualizar URL" : "Guardar URL"}
                  </LoadingButton>
                </div>
              </div>
            </form>
          </Form>

          {/* Ejemplos de URLs válidas */}
          {/* <div className="bg-gray-50 border rounded-lg p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Ejemplos de URLs válidas:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• https://ejemplo.com/certificado.pdf</li>
              <li>• https://drive.google.com/file/d/...</li>
              <li>• https://www.dropbox.com/s/...</li>
              <li>• https://onedrive.live.com/...</li>
            </ul>
          </div> */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
