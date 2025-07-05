"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Calendar, Users, GraduationCap, User } from "lucide-react";
import { Course, CourseLevel, RequiredDocument, Coach } from "@prisma/client";
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
import { SelectLabel } from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

type CourseWithLevels = Course & {
  courseLevels: (CourseLevel & {
    requiredDocuments: RequiredDocument[];
  })[];
};

interface CreateTrainingFormProps {
  courses: CourseWithLevels[];
  coaches: Coach[];
}

const formSchema = z.object({
  courseId: z.string().min(1, "Debe seleccionar un curso"),
  startDate: z.date(),
  location: z.string().optional(),
  coachId: z.string().optional(),
  maxCapacity: z.string().optional(),
});

export const CreateTrainingForm = ({
  courses,
  coaches,
}: CreateTrainingFormProps) => {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState<CourseWithLevels | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: "",
      startDate: new Date(),
      location: "",
      coachId: "",
      maxCapacity: "",
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const { watch } = form;

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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const currentValues = form.getValues();

      console.log("Request body:", currentValues);

      const response = await axios.post("/api/trainings", currentValues);
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
        <CalendarInputForm
          control={form.control}
          label="Fecha de Inicio"
          name="startDate"
          className="w-full"
          disabled={false}
          isSubmitting={isSubmitting}
          icon={<Calendar className="h-4 w-4" />}
        />

        <div
          className={cn(
            "flex flex-col gap-y-2",
            !!selectedCourse && "border border-secondary bg-blue-50/50 rounded-md p-2"
          )}
        >
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

          {/* Mostrar niveles del curso seleccionado */}
          {selectedCourse && (
            <Card className="border-yellow-200 bg-yellow-50/50 p-1 rounded-md">
              <CardHeader className="p-1">
                <CardTitle className="text-yellow-900 text-lg flex items-center gap-x-2">
                  <FaChalkboardUser className="h-4 w-4" /> Niveles Disponibles:{" "}
                  {selectedCourse.name}
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Los colaboradores podrán inscribirse en cualquiera de estos
                  niveles
                </CardDescription>
              </CardHeader>
              <CardContent className="p-1">
                <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
                  {selectedCourse.courseLevels.map((level) => (
                    <div
                      key={level.id}
                      className="flex items-center justify-between p-1 border rounded-lg bg-white"
                    >
                      <div className="p-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {level.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {level.hours} horas • {level.requiredDocuments.length}{" "}
                          doc. requeridos
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800 h-6 w-6"
                      >
                        {level.requiredDocuments.length}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* <Separator /> */}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Ubicación */}
          {/* <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4" />
                  Ubicación
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Salón de capacitaciones, Sede principal"
                    {...field}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* Coach/Instructor */}
          {coaches && coaches.length > 0 ? (
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
                      {coaches.map((coach) => (
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
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="text-gray-500">No hay entrenadores disponibles</div>
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
