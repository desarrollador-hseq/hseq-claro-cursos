"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { TrainingCollaboratorDocument } from "@prisma/client";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import ModalImage from "react-modal-image";
import { toast } from "sonner";
import { z } from "zod";
import {
  Cloud,
  ImageIcon,
  Loader2,
  Pencil,
  PlusCircle,
  UploadCloud,
  FileText,
  CheckCircle,
  X,
  Upload,
  Download,
} from "lucide-react";
import { Form } from "@/components/ui/form";
import PdfRenderer from "@/components/pdf-renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, compressAndResizeImage, formatFileSize } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UpdateDocumentFormProps {
  trainingId: string;
  trainingCollaboratorId: string;
  requiredDocumentId: string;
  label: string;
  ubiPath?: string;
  initialFileUrl?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const formSchema = z.object({
  file: z
    .any()
    .or(z.string())
    .refine((file) => file?.length !== 0, "File is required")
    .refine((files) => {
      return files?.size <= MAX_FILE_SIZE;
    }, `El tamaño maximo del archivo es de 2MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_MIME_TYPES.includes(files?.type),
      "Solo los formatos de .jpg, .jpeg, .png, y .pdf son aceptados"
    ),
});

export const UpdateDocumentForm = ({
  trainingId,
  trainingCollaboratorId,
  requiredDocumentId,
  label,
  ubiPath = "trainings/documents",
  initialFileUrl,
}: UpdateDocumentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | undefined>(initialFileUrl);
  const [document, setDocument] = useState<TrainingCollaboratorDocument | null>(
    null
  );
  const router = useRouter();
  const toggleEdit = () => setIsEditing((current) => !current);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      file: document || undefined,
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const { setValue } = form;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Comprimir imagen si es necesario
        if (file.type.startsWith("image/")) {
          setIsCompressing(true);
          toast.loading(`Comprimiendo imagen: ${file.name}...`, {
            id: "compress-upload",
          });

          compressAndResizeImage(
            file,
            (compressedFile) => {
              setIsCompressing(false);
              toast.dismiss("compress-upload");

              // Mostrar resultado de compresión
              if (compressedFile.size < file.size) {
                const originalSize = formatFileSize(file.size);
                const compressedSize = formatFileSize(compressedFile.size);
                const reduction = Math.round(
                  ((file.size - compressedFile.size) / file.size) * 100
                );
                toast.success(
                  `Imagen comprimida: ${originalSize} → ${compressedSize} (${reduction}% reducción)`
                );
              }

              setSelectedFile(compressedFile);
            },
            (error) => {
              setIsCompressing(false);
              toast.dismiss("compress-upload");
              console.error("Error compressing image:", error);
              toast.error(
                "Error al comprimir la imagen. Usando archivo original."
              );
              setSelectedFile(file);
            }
          );
        } else {
          // Para archivos no-imagen, usar directamente
          setSelectedFile(file);
        }
      }
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".svg"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_FILE_SIZE,
  });

  useEffect(() => {
    if (selectedFile) {
      form.setValue("file", selectedFile as any, { shouldValidate: true });
    }
  }, [selectedFile, form]);

  const isPdf = useMemo(() => fileUrl?.split(".").pop() === "pdf", [fileUrl]);

  // Cargar documento existente
  useEffect(() => {
    const getDocument = async () => {
      try {
        const { data } = await axios.get(
          `/api/trainings/${trainingId}/collaborators/${trainingCollaboratorId}/documents/${requiredDocumentId}`
        );
        setDocument(data);
        setFileUrl(data.documentLink);
      } catch (error) {
        // No hay documento - esto es normal para documentos no subidos aún
        setDocument(null);
        setFileUrl(undefined);
      }
    };
    getDocument();
  }, [trainingId, trainingCollaboratorId, requiredDocumentId]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const progressInterval = startSimulatedProgress();

    try {
      // Crear FormData para enviar archivo y metadatos
      const formData = new FormData();
      formData.append("file", values.file);
      formData.append("ubiPath", ubiPath);

      // Enviar FormData directamente a la API que maneja todo el proceso
      const { data: updatedDocument } = await axios.patch(
        `/api/trainings/${trainingId}/collaborators/${trainingCollaboratorId}/documents/${requiredDocumentId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Actualizar estado local
      setDocument(updatedDocument);
      setFileUrl(updatedDocument.documentLink);

      toast.success("Documento actualizado exitosamente");
      toggleEdit();
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar documento:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data || "Error al procesar la solicitud";
        toast.error(errorMessage);
      } else {
        toast.error(
          "Ocurrió un error inesperado, por favor inténtelo nuevamente"
        );
      }
    } finally {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setSelectedFile(null);
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
    }, 200);

    return interval;
  };

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank");
    }
  };

  return (
    <div className="w-full">
      {/* Header con título y acciones */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-l-4 border-blue-500">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            {/* <p className="text-xs text-gray-600">
              {document ? "Documento cargado" : "Sin documento"}
            </p> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Estado del documento */}
          {/* {document && (
            <Badge 
              variant={document.status === "APPROVED" ? "default" : document.status === "PENDING" ? "secondary" : "destructive"}
              className="text-xs"
            >
              {document.status === "APPROVED" && <CheckCircle className="h-3 w-3 mr-1" />}
              {document.status === "APPROVED" ? "Aprobado" : 
               document.status === "PENDING" ? "Pendiente" : "Rechazado"}
            </Badge>
          )}
           */}
          {/* Botón de descarga */}
          {/* {fileUrl && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-8 px-2"
            >
              <Download className="h-3 w-3" />
            </Button>
          )} */}

          {/* Botón principal */}
          <Button
            onClick={toggleEdit}
            variant={isEditing ? "outline" : "default"}
            size="sm"
            className={cn(
              "h-8 px-3 transition-all",
              isEditing ? "text-gray-600" : "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {isEditing ? (
              <>
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </>
            ) : !fileUrl ? (
              <>
                <PlusCircle className="h-3 w-3 mr-1" />
                Agregar
              </>
            ) : (
              <>
                <Pencil className="h-3 w-3 mr-1" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="border border-t-0 rounded-b-lg bg-white">
        {!isEditing ? (
          // Vista de archivo
          <div className="p-0">
            {!fileUrl ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  No hay documento cargado
                </p>
                <p className="text-xs text-gray-500">
                  Haz clic en Agregar para subir un archivo
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Preview del archivo */}
                <div className="relative bg-gray-50 rounded-lg overflow-hidden">
                  {isPdf ? (
                    <div className="h-64">
                      <PdfRenderer url={fileUrl} showFullscreenButton showDownloadButton />
                    </div>
                  ) : (
                    <div className="p-1">
                      <ModalImage
                        small={fileUrl}
                        large={fileUrl}
                        alt={label}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Información del archivo */}
                {document && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                      <div>
                        <span className="font-medium">Subido:</span>
                        <br />
                        {new Date(document.createdAt).toLocaleDateString(
                          "es-ES"
                        )}
                      </div>
                      {document.fileSize && (
                        <div>
                          <span className="font-medium">Tamaño:</span>
                          <br />
                          {(document.fileSize / 1024).toFixed(1)} KB
                        </div>
                      )}
                    </div>

                    {document.reviewNotes && (
                      <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-xs font-medium text-yellow-800">
                          Notas de revisión:
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {document.reviewNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          // Vista de edición
          <div className="p-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Zona de drag & drop */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                    isDragActive
                      ? "border-blue-400 bg-blue-50"
                      : selectedFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
                  )}
                >
                  <input {...getInputProps()} />

                  {uploadProgress > 0 && uploadProgress < 100 ? (
                    // Estado de subida
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto">
                        <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          Subiendo archivo...
                        </p>
                        <Progress value={uploadProgress} className="mt-2" />
                      </div>
                    </div>
                  ) : selectedFile ? (
                    // Archivo seleccionado
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
                        {selectedFile.type === "application/pdf" ? (
                          <FileText className="h-6 w-6 text-green-600" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-green-900">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-green-700">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Listo
                          para subir
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Quitar archivo
                      </Button>
                    </div>
                  ) : uploadProgress === 100 ? (
                    // Subida completada
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="font-medium text-green-900">
                        ¡Archivo subido exitosamente!
                      </p>
                    </div>
                  ) : (
                    // Estado inicial
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto">
                        <Cloud className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {isDragActive
                            ? "Suelta el archivo aquí"
                            : "Arrastra un archivo o haz clic para seleccionar"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Formatos: JPG, PNG, PDF • Máximo: 1MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón de envío */}
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedFile}
                  className={cn(
                    "w-full",
                    selectedFile &&
                      !isSubmitting &&
                      "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {document ? "Actualizar documento" : "Subir documento"}
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
};
