import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { GraduationCap, Plus } from "lucide-react";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { checkApiPermission } from "@/lib/permissions";
import { CreateTrainingForm } from "./_components/create-training-form";
import TitlePage from "@/components/title-page";

const CreateTrainingPage = async () => {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !checkApiPermission(session.user.role as any, "MANAGE_TRAININGS")
  ) {
    redirect("/dashboard");
  }

  // Obtener cursos disponibles
  const courses = await db.course.findMany({
    where: {
      active: true,
    },
    include: {
      courseLevels: {
        where: {
          active: true,
        },
        include: {
          requiredDocuments: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Obtener coaches disponibles
  const coaches = await db.coach.findMany({
    where: {
      active: true,
    },
    orderBy: {
      fullname: "asc",
    },
  });

  // Obtener cetars disponibles
  const cetars = await db.cetar.findMany({
    where: {
      active: true,
    },
  });

  return (
    <div className="container mx-auto">
      <TitlePage
        title="Nueva Capacitación"
        description="Crea una nueva capacitación seleccionando el curso, entrenador y configurando los detalles necesarios"
        icon={<Plus className="h-7 w-7" />}
      />
      <div className=" mx-auto py-6 space-y-6">
        {/* Header */}
        {/* Formulario */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulario principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Información de la Capacitación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CreateTrainingForm courses={courses} coaches={coaches} cetars={cetars} />
              </CardContent>
            </Card>
          </div>

          {/* Panel de ayuda */}
          {/* <div className="space-y-4">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800 text-lg">
                  💡 Información Importante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-yellow-700">
                <div>
                  <strong>Código:</strong> Se genera automáticamente como un
                  número de 6 dígitos único
                </div>
                <div>
                  <strong>Curso:</strong> Los colaboradores podrán inscribirse
                  en diferentes niveles del curso seleccionado
                </div>
                <div>
                  <strong>Capacidad:</strong> Si no especificas un límite, no
                  habrá restricción de cupos
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800 text-lg">
                  📋 Próximos Pasos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-green-700">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  Crear la capacitación
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  Inscribir colaboradores con documentos
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  Certificar colaboradores
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CreateTrainingPage;
