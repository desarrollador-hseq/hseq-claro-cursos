"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { date, z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Users, User, CalendarIcon } from "lucide-react";
import {
  Course,
  CourseLevel,
  RequiredDocument,
  Coach,
  Cetar,
} from "@prisma/client";
import { FaChalkboardUser } from "react-icons/fa6";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingButton } from "@/components/ui/loading-button";
import { CalendarInputForm } from "@/components/calendar-input-form";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

type CourseWithLevels = Course & {
  courseLevels: (CourseLevel & {
    requiredDocuments: RequiredDocument[];
  })[];
};

interface CreateTrainingFormProps {
  courses: CourseWithLevels[];
  coaches: Coach[];
  cetars: Cetar[];
}

const formSchema = z
  .object({
    courseId: z.string().min(1, "Debe seleccionar un curso"),
    courseLevelId: z.string().min(1, "Debe seleccionar un nivel"),
    startDate: z.date().or(z.string()),
    endDate: z.date().or(z.string()),
    location: z.string().optional(),
    coachId: z.string().optional(),
    cetarId: z.string().optional(),
    maxCapacity: z.string().optional(),
    byCetar: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    // Si byCetar es true, cetarId es requerido
    if (data.byCetar && (!data.cetarId || data.cetarId.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar un CETAR",
        path: ["cetarId"],
      });
    }

    // Si byCetar es false, coachId es requerido
    if (!data.byCetar && (!data.coachId || data.coachId.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Debe seleccionar un entrenador",
        path: ["coachId"],
      });
    }
  });

export const CreateTrainingForm = ({
  courses,
  coaches,
  cetars,
}: CreateTrainingFormProps) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithLevels | null>(
    null
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      courseLevelId: "",
      startDate: undefined,
      endDate: undefined,
      location: "",
      coachId: "",
      cetarId: "",
      maxCapacity: "",
      byCetar: false,
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const { watch, setValue } = form;

  // Actualizar curso seleccionado cuando cambie courseId
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "courseId" && value.courseId) {
        const course = courses.find((c) => c.id === value.courseId);
        setSelectedCourse(course || null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, courses]);

  useEffect(() => {
    if (dateRange?.from !== undefined && dateRange.to !== undefined) {
      setValue("startDate", dateRange.from!, { shouldValidate: true });
      setValue("endDate", dateRange.to!, { shouldValidate: true });
    }
  }, [calendarOpen, setDateRange, dateRange?.from, dateRange?.to, setValue]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const currentValues = form.getValues();

      const body = {
        ...currentValues,
        byCetar: currentValues.byCetar ? true : false,
        cetarId: currentValues.byCetar ? currentValues.cetarId : null,
        coachId: currentValues.byCetar ? null : currentValues.coachId,
      };

      const response = await axios.post("/api/trainings", body);
      toast.success(
        `Capacitación creada exitosamente. Código: ${response.data.code}`
      );
      router.push(`/admin/capacitaciones/${response.data.id}`);
      router.refresh();
    } catch (error) {
      console.log({ error });
      if (axios.isAxiosError(error)) {
        toast.error("Error al crear la capacitación");
      } else {
        toast.error("Ocurrió un error inesperado");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Fecha de inicio */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="font-bold">Fechas de formación</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "h-11 w-full justify-start text-left bg-slate-100 hover:bg-slate-200 text-lg font-semibold",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd LLLL y", {
                            locale: es,
                          })}{" "}
                          - {format(dateRange.to, "dd LLLL y", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd LLLL y", { locale: es })
                      )
                    ) : (
                      <span>Selecciona un rango de fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={new Date()}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="ml-6 text-[0.8rem] text-red-500 font-medium" />
            </FormItem>
          )}
        />
        <div
          className={cn(
            "flex flex-col gap-y-4",
            !!selectedCourse &&
              "border border-secondary bg-blue-50/50 rounded-md p-4"
          )}
        >
          <FormField
            control={form.control}
            name="byCetar"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">
                  Tipo de Capacitación
                </FormLabel>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value ? "cetar" : "no-cetar"}
                    onValueChange={(value) => {
                      field.onChange(value === "cetar");
                    }}
                    className="justify-start gap-0 border rounded-md overflow-hidden"
                  >
                    <ToggleGroupItem
                      value="no-cetar"
                      aria-label="UVAE"
                      className={cn(
                        "flex-1 h-16 gap-3 rounded-none border data-[state=on]:bg-blue-200 data-[state=on]:text-blue-900 data-[state=on]:border-blue-400 rounded-l-md",
                        !field.value &&
                          "bg-blue-100 text-blue-900 border-blue-200"
                      )}
                    >
                      {/* <X className="h-4 w-4" /> */}
                      <div className="text-left">
                        <div className="font-medium">UVAE</div>
                        <div className="text-xs opacity-70"></div>
                      </div>
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="cetar"
                      aria-label="CETAR"
                      className={cn(
                        "flex-1 h-16 gap-3 rounded-none border data-[state=on]:bg-green-100 data-[state=on]:text-green-900 data-[state=on]:border-green-400 rounded-r-md",
                        field.value && "bg-green-50 text-green-900"
                      )}
                    >
                      {/* <Check className="h-4 w-4" /> */}
                      <div className="text-left">
                        <div className="font-medium">CETAR</div>
                        {/* <div className="text-xs opacity-70">Sin documentación requerida</div> */}
                      </div>
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-6 md:grid-cols-2">
            {/* Curso */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <FaChalkboardUser className="h-4 w-4" />
                    Curso
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Limpiar el nivel seleccionado si cambia el curso
                      setValue("courseLevelId", "");
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Selecciona un curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{course.name}</span>
                            {course.shortName && (
                              <span className="text-sm text-gray-500">
                                {course.shortName}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Nivel del curso */}
            {selectedCourse && (
              <FormField
                control={form.control}
                name="courseLevelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-semibold">
                      Nivel del Curso
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCourse}
                    >
                      <FormControl>
                        <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Selecciona un nivel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedCourse.courseLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{level.name}</span>
                              <span className="text-xs text-gray-500">
                                {level.hours} horas •{" "}
                                {level.requiredDocuments.length} doc. requeridos
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Mostrar niveles del curso seleccionado */}
        </div>

        {/* <Separator /> */}

        <div className="grid gap-6 md:grid-cols-2">
          {/* CETAR - Solo mostrar cuando byCetar es true */}
          {watch("byCetar") && (
            <FormField
              control={form.control}
              name="cetarId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4" />
                    CETAR
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Selecciona un CETAR" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cetars && cetars.length > 0 ? (
                        cetars.map((cetar) => (
                          <SelectItem key={cetar.id} value={cetar.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{cetar.name}</span>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>ID: {cetar.id.slice(-8)}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="null" disabled>
                          No hay CETAR disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Coach/Instructor - Solo mostrar cuando byCetar es false */}
          {!watch("byCetar") && (
            <FormField
              control={form.control}
              name="coachId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4" />
                    Entrenador/Instructor
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="transition-all focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Selecciona un entrenador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coaches && coaches.length > 0 ? (
                        coaches.map((coach) => (
                          <SelectItem key={coach.id} value={coach.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-medium">
                                {coach.fullname}
                              </span>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{coach.numDoc}</span>
                                {coach.position && (
                                  <>
                                    <span>•</span>
                                    <span>{coach.position}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="null" disabled>
                          No hay entrenadores disponibles
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Capacidad máxima */}
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-semibold">
                  <Users className="h-4 w-4" />
                  Capacidad Máxima
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Ej: 25 (opcional)"
                    {...field}
                    className="max-w-xs transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-gray-500">
                  Si no especificas un límite, no habrá restricción de cupos
                </p>
              </FormItem>
            )}
          />
        </div>
        <Separator />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <LoadingButton
            type="submit"
            disabled={isSubmitting || !isValid}
            loading={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
          >
            Crear Capacitación
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
};
