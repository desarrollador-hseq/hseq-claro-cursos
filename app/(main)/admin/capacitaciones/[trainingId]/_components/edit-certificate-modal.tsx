"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Edit3,
  Award,
  Calendar,
  User,
  Building,
  FileText,
  Save,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingButton } from "@/components/ui/loading-button";

const certificateSchema = z.object({
  // Información del colaborador
  collaboratorFullname: z.string().min(1, "Nombre completo es requerido"),
  collaboratorNumDoc: z.string().min(1, "Número de documento es requerido"),
  collaboratorTypeDoc: z.enum(["CC", "TI", "CE", "PA", "RC", "NIT"]),
  collaboratorCityName: z.string().optional(),
  collaboratorArlName: z.string().min(1, "Nombre de ARL es requerido"),
  companyName: z.string().min(1, "Nombre de empresa es requerido"),
  legalRepresentative: z.string().min(1, "Representante legal es requerido"),
  companyNit: z.string().min(1, "NIT de empresa es requerido"),
  // Información del curso
  courseName: z.string().min(1, "Nombre del curso es requerido"),
  levelName: z.string().min(1, "Nombre del nivel es requerido"),
  resolution: z.string().optional(),
  levelHours: z.number().min(1, "Horas del nivel son requeridas"),
  monthsToExpire: z.number().min(0, "Meses para expirar debe ser positivo"),

  // Información del coach
  coachName: z.string().min(1, "Nombre del coach es requerido"),
  coachPosition: z.string().optional(),
  coachLicence: z.string().optional(),

  // Fechas
  certificateDate: z.string().min(1, "Fecha de certificado es requerida"),
  startDate: z.string().min(1, "Fecha de inicio es requerida"),
  expeditionDate: z.string().min(1, "Fecha de expedición es requerida"),
  dueDate: z.string().optional(),
});

type CertificateFormValues = z.infer<typeof certificateSchema>;

interface EditCertificateModalProps {
  certificateId: string;
  onUpdate?: () => void;
}

export const EditCertificateModal = ({
  certificateId,
  onUpdate,
}: EditCertificateModalProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      collaboratorFullname: "",
      collaboratorNumDoc: "",
      collaboratorTypeDoc: "CC",
      collaboratorArlName: "",
      companyName: "CLARO COLOMBIA S.A.S",
      legalRepresentative: "",
      companyNit: "800225440-9",
      courseName: "",
      levelName: "",
      resolution: "",
      levelHours: 0,
      monthsToExpire: 0,
      coachName: "",
      coachPosition: "",
      coachLicence: "",
      certificateDate: "",
      startDate: "",
      expeditionDate: "",
      dueDate: "",
      collaboratorCityName: "",
    },
  });

  // Cargar datos del certificado
  useEffect(() => {
    if (isOpen && certificateId) {
      loadCertificate();
    }
  }, [isOpen, certificateId]);

  const loadCertificate = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/certificates/${certificateId}`);
      const certificate = response.data;

      // Formatear fechas para input date
      const formatDate = (date: string | null) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
      };

      form.reset({
        collaboratorFullname: certificate.collaboratorFullname || "",
        collaboratorNumDoc: certificate.collaboratorNumDoc || "",
        collaboratorTypeDoc: certificate.collaboratorTypeDoc || "CC",
        collaboratorArlName: certificate.collaboratorArlName || "ARL BOLIVAR",
        companyName: certificate.companyName || "CLARO COLOMBIA S.A.S",
        legalRepresentative:
          certificate.legalRepresentative || "MARCELO CATALDO",
        companyNit: certificate.companyNit || "800225440-9",
        courseName: certificate.courseName || "",
        levelName: certificate.levelName || "",
        resolution: certificate.resolution || "",
        levelHours: certificate.levelHours || 0,
        monthsToExpire: certificate.monthsToExpire || 0,
        coachName: certificate.coachName || "",
        coachPosition: certificate.coachPosition || "",
        coachLicence: certificate.coachLicence || "",
        certificateDate: formatDate(certificate.certificateDate),
        startDate: formatDate(certificate.startDate),
        expeditionDate: formatDate(certificate.expeditionDate),
        dueDate: formatDate(certificate.dueDate),
        collaboratorCityName: certificate.collaboratorCityName || "",
      });
    } catch (error) {
      console.error("Error loading certificate:", error);
      toast.error("Error al cargar el certificado");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: CertificateFormValues) => {
    setIsSubmitting(true);
    try {
      await axios.put(`/api/certificates/${certificateId}`, values);
      toast.success("Certificado actualizado exitosamente");
      setIsOpen(false);
      if (onUpdate) onUpdate();
      router.refresh();
    } catch (error) {
      console.error("Error updating certificate:", error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Error al actualizar el certificado"
        );
      } else {
        toast.error("Error inesperado al actualizar el certificado");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            Editar Certificado
          </DialogTitle>
          <p className="text-sm text-gray-600">
            {form.getValues("collaboratorFullname")} - {form.getValues("courseName")}
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información del Colaborador */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del Colaborador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="collaboratorFullname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="collaboratorNumDoc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Documento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="collaboratorTypeDoc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Documento</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CC">
                                Cédula de Ciudadanía
                              </SelectItem>
                              <SelectItem value="TI">
                                Tarjeta de Identidad
                              </SelectItem>
                              <SelectItem value="CE">
                                Cédula de Extranjería
                              </SelectItem>
                              <SelectItem value="PA">Pasaporte</SelectItem>
                              <SelectItem value="RC">Registro Civil</SelectItem>
                              <SelectItem value="NIT">NIT</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="collaboratorArlName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de ARL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="collaboratorCityName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad del colaborador</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información de la Empresa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="companyNit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NIT de la Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="legalRepresentative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Representante Legal</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información del Curso */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Información del Curso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="courseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Curso</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="levelName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="resolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolución</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="levelHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horas del Nivel</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
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
                          <FormLabel>Meses para Expirar</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información del Coach */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información del entrenador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="coachName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del entrenador</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coachPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo del entrenador</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="coachLicence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Licencia del entrenador</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Fechas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Fechas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="certificateDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del Certificado</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Inicio</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expeditionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Expedición</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Vencimiento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </LoadingButton>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
