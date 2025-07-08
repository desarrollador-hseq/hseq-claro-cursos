"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coach } from "@prisma/client";
import axios from "axios";
import {
  Cloud,
  UserPlus,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { SignaturePreview } from "./signature-preview";
import { DocumentInputForm } from "@/components/document-input-form";

interface AddCoachFormProps {
  coach?: Coach | null;
}

const formSchema = z.object({
  fullname: z.string().min(1, "Nombre del entrenador es requerido"),
  position: z.string().min(1, "Cargo del entrenador es requerido"),
  numDoc: z.string().min(1, "Número de documento del entrenador es requerido"),
  docType: z.string().min(1, "Tipo de documento del entrenador es requerido"),
  license: z.string().optional(),
});

export const AddCoachForm = ({ coach }: AddCoachFormProps) => {
  const router = useRouter();
  const isEdit = useMemo(() => coach, [coach]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (isEdit && !coach) {
    router.replace("/admin/entrenadores/");
    toast.error("Entrenador no encontrado, redirigiendo...");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: coach?.fullname || "",
      numDoc: coach?.numDoc
        ? new Intl.NumberFormat("es-ES").format(
            Number(coach.numDoc.toString().replace(/\./g, ""))
          )
        : "",
      docType: coach?.docType || "CC",
      position: coach?.position || "",
      license: coach?.license || "",
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedFile(acceptedFiles[0]);
    },
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    maxSize: 1024 * 1024, // 1MB
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Crear FormData para enviar archivos y datos
      const formData = new FormData();
      formData.append("fullname", values.fullname);
      formData.append("numDoc", values.numDoc.replace(/\./g, ""));
      formData.append("docType", values.docType);
      formData.append("position", values.position);
      formData.append("license", values.license || "");

      // Agregar archivo de firma si existe
      if (selectedFile) {
        formData.append("signatureFile", selectedFile);
      } else if (isEdit) {
        // Mantener la imagen actual en edición si no se selecciona nueva
        formData.append("keepCurrentSignature", "true");
      }

      if (isEdit) {
        await axios.patch(`/api/coaches/${coach?.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Entrenador actualizado correctamente");
      } else {
        await axios.post(`/api/coaches`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Entrenador creado exitosamente");
      }

      router.push(`/admin/entrenadores`);
      router.refresh();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data || "Error al procesar la solicitud");
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    }
  };

  return (
    <div className="bg-white rounded-sm p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Nombre completo
                  </FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Rol</FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DocumentInputForm
              // control={form.control}
              label="Identificación"
              typeFieldName="docType"
              numberFieldName="numDoc"
            />

            <FormField
              control={form.control}
              name="license"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Licencia (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Sección de imagen de firma */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-secondary">Imagen de Firma</h3>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
                selectedFile ? "border-green-500 bg-green-50" : ""
              )}
            >
              <input {...getInputProps()} disabled={isSubmitting} />

              {selectedFile ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Imagen seleccionada
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : coach?.signatureUrl && isEdit ? (
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Image
                      src={coach.signatureUrl}
                      alt="Current signature"
                      width={100}
                      height={100}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Imagen actual
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Haz clic o arrastra una nueva imagen para reemplazar
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Sube la imagen de firma
                  </p>
                  <p className="text-sm text-gray-500">
                    Haz clic aquí o arrastra una imagen (JPG, PNG - Máx. 1MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Botón de envío */}
          <LoadingButton
            type="submit"
            disabled={isSubmitting || !isValid}
            loading={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isEdit ? "Actualizar Entrenador" : "Crear Entrenador"}
          </LoadingButton>
        </form>
      </Form>

      {/* Preview de certificado */}
      {isValid && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">
            Vista previa de la firma
          </h3>
          <div className="flex justify-center">
            <PDFViewer
              showToolbar={false}
              style={{ width: "500px", height: "400px" }}
            >
              <SignaturePreview
                imgSignatureUrl={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : coach?.signatureUrl || undefined
                }
                name={form.watch("fullname")}
                position={form.watch("position")}
                licence={form.watch("license")}
              />
            </PDFViewer>
          </div>
        </div>
      )}
    </div>
  );
};
