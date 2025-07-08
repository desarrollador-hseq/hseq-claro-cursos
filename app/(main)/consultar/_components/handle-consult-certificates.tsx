"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Certificate, City, Collaborator } from "@prisma/client";
import axios from "axios";
import {
  Award,
  Search,
  User,
  FileText,
  Calendar,
  RotateCcw,
  Eye,
  AlertTriangle,
  CheckCircle,
  GraduationCap,
  UserCheck,
  FileStack,
  FileBadge,
  EyeOff,
  Ban,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import ShowCertificate from "@/components/certificates/show-certificate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatDateCert } from "@/lib/utils";
import { FormattedNumberInput } from "@/app/(main)/admin/colaboradores/[collaboratorId]/_components/formatted-input-form";
import { LoadingButton } from "@/components/ui/loading-button";

const formSchema = z.object({
  numDoc: z.string().min(1, {
    message: "Número de documento es requerido",
  }),
});

export const HandleConsultCertificates = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [consulted, setConsulted] = useState(false);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaborator, setCollaborator] = useState<
    (Collaborator & { certificates: Certificate[] }) | null
  >();

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { numDoc: "" },
  });
  const { isSubmitting, isValid } = form.formState;
  const { reset } = form;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `/api/collaborators/doc/${values.numDoc}`
      );

      setCollaborator(data);
      router.refresh();
    } catch (error) {
      toast.error(
        "Ocurrió un error al consultar el certificado por favor intentelo nuevamente"
      );
      console.log("errorr", error);
    } finally {
      setIsLoading(false);
      setConsulted(true);
      reset();
    }
  };

  const checkedCertificate = async (id: string) => {
    try {
      const { data } = await axios.patch(`/api/collaborators/${id}`, {
        checkCertificate: true,
      });

      console.log({ checkedCert: id });
      console.log({ data });
    } catch (error) {
      console.log("errorr", error);
    }
  };

  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
    checkedCertificate(collaborator?.id || "");
  };

  const resetForm = () => {
    setConsulted(false);
    setCollaborator(null);
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Search Form */}
        {consulted ? (
          <div className="flex justify-center my-4">
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full h-12 text-lg border-2 hover:bg-gray-50 max-w-xs mx-auto"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Nueva Consulta
            </Button>
          </div>
        ) : (
          <Card className="max-w-md mx-auto mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              {/* <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Search className="h-5 w-5 text-blue-600" />
                Buscar Certificados
              </CardTitle> */}
              <CardDescription className="text-center text-xs leading-3 mb-2">
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Con su <span className="font-bold">número de documento</span>{" "}
                  podrás consultar sus certificados de capacitación
                </p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="numDoc"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FormattedNumberInput
                            field={field}
                            className="h-12 text-lg font-semibold border-2 focus:border-blue-500 transition-colors"
                            placeholder="Ingrese su número de documento"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <LoadingButton
                    disabled={!isValid || isSubmitting}
                    className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
                    loading={isSubmitting}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Consultar Certificados
                  </LoadingButton>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {consulted && (
          <div className="max-w-4xl mx-auto">
            {!collaborator ? (
              // No Results
              <Card className="text-center py-12 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-red-100 p-4 rounded-full">
                      <AlertTriangle className="h-12 w-12 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      No se encontraron resultados
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      No encontramos certificados asociados con el número de
                      documento ingresado.
                    </p>
                    <Button
                      onClick={resetForm}
                      className="mt-4 bg-blue-600 hover:bg-blue-700"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Intentar de nuevo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* User Info Card */}
                <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg overflow-hidden">
                  <CardHeader className="bg-secondary">
                    <CardTitle className="flex items-center gap-3 text-white">
                      <UserCheck className="h-6 w-6" />
                      Información del Colaborador
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            Número de Documento
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {collaborator.numDoc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-3 rounded-full">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            Nombre Completo
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {collaborator.name} {collaborator.lastname}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="bg-yellow-100 p-3 rounded-full">
                          <Award className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            Total Certificados
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {collaborator.certificates?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificates */}
                {collaborator.certificates &&
                collaborator.certificates.length > 0 ? (
                  <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        Certificados de Capacitación
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {collaborator.certificates
                          .sort((a, b) => {
                            // Check if certificates are expired
                            const aExpired =
                              a.dueDate && new Date(a.dueDate) < new Date();
                            const bExpired =
                              b.dueDate && new Date(b.dueDate) < new Date();

                            if (aExpired !== bExpired) {
                              return aExpired ? 1 : -1;
                            }

                            if (a.dueDate && b.dueDate) {
                              return (
                                new Date(b.dueDate).getTime() -
                                new Date(a.dueDate).getTime()
                              );
                            }

                            return 0;
                          })
                          .map((certificate) => {
                            let isExpired = false;

                            if (
                              certificate.dueDate &&
                              new Date(certificate.dueDate) < new Date()
                            ) {
                              isExpired = true;
                            }

                            return (
                              <Card
                                key={certificate.id}
                                className={cn(
                                  "border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer group",
                                  isExpired &&
                                    "opacity-50 border-red-400 bg-red-200"
                                )}
                                onClick={() =>
                                  isExpired
                                    ? null
                                    : handleViewCertificate(certificate)
                                }
                              >
                                <CardContent className="p-4 relative">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4
                                          className={cn(
                                            "font-bold text-gray-900 group-hover:text-blue-600 transition-colors",
                                            isExpired &&
                                              "text-red-600 group-hover:text-red-600"
                                          )}
                                        >
                                          {certificate.courseName}
                                        </h4>
                                        <Badge
                                          variant="secondary"
                                          className="mt-1"
                                        >
                                          {certificate.levelName}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        {certificate.certificateDate
                                          ? formatDateCert(
                                              new Date(
                                                certificate.certificateDate
                                              )
                                            )
                                          : "Fecha no disponible"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      {isExpired ? (
                                        <Ban className="h-4 w-4 text-red-600" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                      <span
                                        className={cn(
                                          "text-sm font-medium",
                                          isExpired
                                            ? "text-red-600"
                                            : "text-green-600"
                                        )}
                                      >
                                        {isExpired
                                          ? "Certificado vencido"
                                          : "Certificado válido"}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="absolute bottom-2 right-2">
                                    {isExpired ? (
                                      <EyeOff className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    ) : (
                                      <Eye className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    )}
                                  </span>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="text-center py-12 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
                    <CardContent>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-gray-100 p-4 rounded-full">
                          <Award className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          Sin certificados disponibles
                        </h3>
                        <p className="text-gray-600 max-w-md">
                          Este colaborador aún no tiene certificados de
                          capacitación registrados.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Certificate Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] h-[90vh] overflow-y-auto bg-primary px-0">
            <DialogHeader className="px-4 sticky top-0 z-50 text-white">
              <DialogClose asChild className="absolute right-2 top-">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1 h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground focus:ring-2 focus:ring-primary-foreground/50 rounded-full"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar</span>
                </Button>
              </DialogClose>
              <DialogTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                Certificado: {selectedCertificate?.courseName}
              </DialogTitle>
            </DialogHeader>
            <div className="">
              {selectedCertificate && (
                <ShowCertificate certificateId={selectedCertificate.id} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
