import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import { DocType, EppCertificationInspection, EppType } from "@prisma/client";
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, HardHat } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
  eppBrand: z.string().min(1),
  eppModel: z.string().min(1),
  eppSerialNumber: z.string().min(1),
  inspectorName: z.string().min(1),
  isSuitable: z.boolean(),
  eppType: z.nativeEnum(EppType),
});

const EPP_TYPES = [
  { value: "ARNES_CUERPO_COMPLETO", name: "ARNÉS CUERPO COMPLETO" },
  {
    value: "ESLINGA_DOBLE_TERMINAL_EN_Y",
    name: "ESLINGA DE DOBLE TERMINAL EN Y",
  },
  { value: "ESLINGA_POSICIONAMIENTO", name: "ESLINGA DE POSICIONAMIENTO" },
  { value: "FRENO_ARRESTADOR_CABLE", name: "FRENO O ARRESTADOR DE CABLE" },
  { value: "MOSQUETON", name: "MOSQUETÓN" },
  { value: "ANCLAJE_TIPO_TIE_OFF", name: "ANCLAJE TIPO TIE OFF" },
];

export const UpdateEppInfo = ({
  inspection,
}: {
  inspection: EppCertificationInspection;
}) => {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      eppBrand: inspection.eppBrand,
      eppModel: inspection.eppModel,
      eppSerialNumber: inspection.eppSerialNumber,
      inspectorName: inspection.inspectorName,
      isSuitable: inspection.isSuitable,
      eppType: inspection.eppType,
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.patch(
        `/api/epp-certifications/${inspection.id}`,
        {
          ...values,
        }
      );

      toast.success("Información del equipo actualizada correctamente");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la información del equipo");
    }
  };
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardHat className="w-5 h-5 mr-2" />
          Información del Equipo
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-2"
          >
            <div>
              <FormField
                control={form.control}
                name="eppType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de EPP</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={true}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de EPP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EPP_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="eppBrand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="eppModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lote</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="eppSerialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Serie</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="inspectorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspector</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="isSuitable"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usabilidad</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? "APTO" : "NO APTO"}
                        onValueChange={(value) =>
                          field.onChange(value === "APTO")
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APTO">APTO</SelectItem>
                          <SelectItem value="NO APTO">NO APTO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 flex justify-end mt-4 w-full">
              <LoadingButton
                type="submit"
                disabled={isSubmitting || !isDirty}
                loading={isSubmitting}
                variant={"default"}
              >
                Actualizar
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const schemaDates = z.object({
  inspectionDate: z.date(),
  certificationDate: z.date(),
});

export const UpdateEppDatesInfoForm = ({
  inspection,
}: {
  inspection: EppCertificationInspection;
}) => {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      inspectionDate: inspection.inspectionDate,
      certificationDate: inspection.certificationDate,
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (values: z.infer<typeof schemaDates>) => {
    try {
      const response = await axios.patch(
        `/api/epp-certifications/${inspection.id}`,
        {
          ...values,
        }
      );
      router.refresh();

      toast.success("Fechas actualizadas correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar las fechas");
    }
  };
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardHat className="w-5 h-5 mr-2" />
          Información del Equipo
        </CardTitle>
        <div className="flex items-center justify-start gap-2 mt-2">
          <div className="bg-gray-100 px-2 rounded-md">
            <Label className="text-sm font-medium text-gray-600">Creado</Label>
            <p className="font-medium text-xs">
              {formatDate(new Date(inspection.createdAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
          <div className="bg-gray-100 px-2 rounded-md">
            <Label className="text-sm font-medium text-gray-600">
              Última Actualización
            </Label>
            <p className="font-medium text-xs">
              {formatDate(new Date(inspection.updatedAt), "dd/MM/yyyy HH:mm")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-2"
          >
            <div>
              <FormField
                control={form.control}
                name="inspectionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Inspección</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value, "PPP")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="certificationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Certificación</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value, "PPP")
                              ) : (
                                <span>Seleccionar fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="col-span-2 flex justify-end mt-4 w-full">
              <LoadingButton
                type="submit"
                disabled={isSubmitting || !isDirty}
                loading={isSubmitting}
                variant={"default"}
              >
                Actualizar
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const schemaCollaborator = z.object({
  collaboratorName: z.string().min(1),
  collaboratorNumDoc: z.string().min(1),
  collaboratorTypeDoc: z.nativeEnum(DocType),
  collaboratorCityName: z.string().min(1),
});

const DOC_TYPES = [
  { value: "CC", name: "Cédula de Ciudadanía" },
  { value: "CE", name: "Cédula de Extranjería" },
  { value: "TI", name: "Tarjeta de Identidad" },
  { value: "PA", name: "Pasaporte" },
  { value: "PE", name: "Permiso especial de circulación" },
];

export const UpdateEppCollaboratorForm = ({
  inspection,
}: {
  inspection: EppCertificationInspection;
}) => {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      collaboratorName: inspection.collaboratorName,
      collaboratorNumDoc: inspection.collaboratorNumDoc,
      collaboratorTypeDoc: inspection.collaboratorTypeDoc,
      collaboratorCityName: inspection.collaboratorCityName,
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (values: z.infer<typeof schemaCollaborator>) => {
    try {
      const response = await axios.patch(
        `/api/epp-certifications/${inspection.id}`,
        {
          ...values,
        }
      );
      router.refresh();

      toast.success("Información del colaborador actualizada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la información del colaborador");
    }
  };
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardHat className="w-5 h-5 mr-2" />
          Información del Colaborador
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-2 gap-2"
          >
            <div>
              <FormField
                control={form.control}
                name="collaboratorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name="collaboratorTypeDoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo de documento" />
                        </SelectTrigger>
                        <SelectContent>
                          {DOC_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
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
            </div>
            <div>
              <FormField
                control={form.control}
                name="collaboratorCityName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ciudad</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-2 flex justify-end mt-4 w-full">
              <LoadingButton
                type="submit"
                disabled={isSubmitting || !isDirty}
                loading={isSubmitting}
                variant={"default"}
              >
                Actualizar
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
