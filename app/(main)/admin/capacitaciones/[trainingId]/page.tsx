import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MdOutlinePendingActions } from "react-icons/md";

import {
  Calendar,
  Users,
  GraduationCap,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  FileStack,
  ThumbsDown,
  ArrowLeft,
} from "lucide-react";
import { TrainingCollaboratorsList } from "./_components/training-collaborators-list";
import { TrainingStatusManager } from "./_components/training-status-manager";
import { formatDate } from "@/lib/utils";
import TitlePage from "@/components/title-page";
import { getFormationThreshold } from "@/actions/parameters";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TrainingPageProps {
  params: {
    trainingId: string;
  };
}

const TrainingPage = async ({ params }: TrainingPageProps) => {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";

  if (!session) {
    redirect("/login");
  }

  // Obtener capacitación con todos los datos necesarios
  const training = await db.training.findUnique({
    where: {
      id: params.trainingId,
      active: true,
      status: {
        in: ["ACTIVE", "COMPLETED", "PLANNED"],
      },
    },
    include: {
      course: {
        include: {
          courseLevels: {
            include: {
              requiredDocuments: {
                where: {
                  active: true,
                },
              },
            },
          },
        },
      },

      trainingCollaborators: {
        include: {
          collaborator: {
            include: {
              city: {
                include: {
                  regional: true,
                },
              },
              certificates: {
                where: {
                  
                  active: true,
                },
              },
              cetarCertificates: {
                where: {
                  trainingId: params.trainingId,
                  active: true,
                },
              },
            },
          },

          courseLevel: {
            include: {
              requiredDocuments: true,
            },
          },
          documents: {
            include: {
              requiredDocument: true,
            },
          },
        },
      },
      coach: true,
    },
  });

  if (!training) {
    return (
      <div className="container text-center text-2xl font-bold h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-4xl font-bold">Capacitación no encontrada</div>
            <div className="text-sm text-gray-500">
              La capacitación que estás buscando no existe o ha sido eliminada.
            </div>
          </div>
          <Link href="/admin/capacitaciones">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a la lista de capacitaciones
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Obtener colaboradores disponibles para inscribir
  const availableCollaborators = await db.collaborator.findMany({
    where: {
      active: true,
      id: {
        notIn: training.trainingCollaborators.map((tc) => tc.collaboratorId),
      },
    },
    include: {
      city: {
        include: {
          regional: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const threshold = await getFormationThreshold();

  // Estadísticas
  const totalCollaborators = training.trainingCollaborators.length;
  const collaboratorsWithCompleteDocuments =
    training.trainingCollaborators.filter((tc) => {
      const requiredDocsCount = tc.courseLevel.requiredDocuments.length;

      // Filtrar solo los documentos que corresponden a los documentos requeridos del nivel actual
      const currentLevelRequiredDocIds = tc.courseLevel.requiredDocuments.map(
        (doc) => doc.id
      );
      const validSubmittedDocs = tc.documents.filter((doc) =>
        currentLevelRequiredDocIds.includes(doc.requiredDocumentId)
      );

      const approvedDocsCount = validSubmittedDocs.filter(
        (doc) => doc.status === "APPROVED"
      ).length;
      return requiredDocsCount > 0
        ? approvedDocsCount === requiredDocsCount
        : true;
    }).length;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PLANNED: {
        label: "Planificada",
        variant: "secondary" as const,
        icon: Clock,
      },
      ACTIVE: {
        label: "En Curso",
        variant: "default" as const,
        icon: CheckCircle,
      },
      COMPLETED: {
        label: "Completada",
        variant: "default" as const,
        icon: CheckCircle,
      },
      CANCELLED: {
        label: "Cancelada",
        variant: "destructive" as const,
        icon: AlertCircle,
      },
      POSTPONED: {
        label: "Pospuesta",
        variant: "secondary" as const,
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge
        variant={config?.variant || "secondary"}
        className="flex items-center gap-1"
      >
        <Icon className="h-3 w-3" />
        {config?.label || status}
      </Badge>
    );
  };

  const noScore = training.trainingCollaborators.filter(
    (tc) => tc.finalScore === null || tc.finalScore === undefined
  ).length;

  const insufficientScore = training.trainingCollaborators.filter(
    (tc) =>
      tc.finalScore !== null &&
      tc.finalScore !== undefined &&
      tc.finalScore < threshold
  ).length;

  const isDisabled =
    training.status === "COMPLETED" ||
    training.status === "CANCELLED" ||
    training.status === "POSTPONED";

  return (
    <div className="container">
      <TitlePage
        title={"Capacitación"}
        description="Información de la capacitación"
      />
      <div className="mx-auto py-0 space-y-3">
        {/* Header */}
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 pb-0">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-blue-900">
                    {training.code} {training.byCetar ? "(CETAR)" : "(UVAE)"}
                  </h1>
                  {getStatusBadge(training.status)}
                </div>
                <p className="text-slate-500 font-medium text-lg">
                  Curso:{" "}
                  <span className="font-bold text-blue-600">
                    {training.course.name}
                  </span>
                </p>
                {training.course.shortName && (
                  <p className="text-sm text-blue-600">
                    {training.course.shortName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <TrainingStatusManager training={training} />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Información general */}
        <div
          className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${
            isDisabled ? "opacity-50" : ""
          }`}
        >
          <Card className="pb-0">
            <CardContent className="py-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Fecha de Inicio
                  </p>
                  <p className="text-lg font-semibold">
                    {formatDate(training.startDate, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="pb-0">
            <CardContent className="py-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Colaboradores
                  </p>
                  <p className="text-lg font-semibold">
                    {totalCollaborators}
                    {training.maxCapacity && ` / ${training.maxCapacity}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="pb-0">
            <CardContent className="py-3">
              <div className="flex items-center space-x-2">
                <FileStack className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Niveles Disponibles
                  </p>
                  <p className="text-lg font-semibold">
                    {training.course.courseLevels.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="pb-0">
            <CardContent className="py-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Entrenador/Instructor
                  </p>
                  <p className="text-lg font-semibold flex flex-col items-start justify-center">
                    {training.coach?.fullname || "No asignado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          {!training.byCetar && (
            <>
              <Separator className="bg-gray-200 md:col-span-2 lg:col-span-4 my-0" />
              <Card className="border-yellow-200 bg-yellow-50 pb-0">
                <CardContent className="py-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total documentos
                      </p>
                      <p className="text-lg font-semibold">
                        {collaboratorsWithCompleteDocuments} /{" "}
                        {totalCollaborators}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-orange-200 bg-orange-50 pb-0">
                <CardContent className="py-3">
                  <div className="flex items-center space-x-2">
                    <MdOutlinePendingActions className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Por Calificar
                      </p>
                      <p className="text-lg font-semibold">{noScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200 bg-red-50 pb-0">
                <CardContent className="py-3">
                  <div className="flex items-center space-x-2">
                    <ThumbsDown className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        No Aprobados
                      </p>
                      <p className="text-lg font-semibold">
                        {insufficientScore}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Detalles adicionales */}
        {/* {(training.location || training.instructor) && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Capacitación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {training.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Ubicación
                    </p>
                    <p className="text-gray-900">{training.location}</p>
                  </div>
                </div>
              )}
              {training.instructor && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Instructor
                    </p>
                    <p className="text-gray-900">{training.instructor}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )} */}

        {/* Gestión de colaboradores */}
        <div className="grid gap-6 w-full">
          <div className="">
            <TrainingCollaboratorsList
              training={training}
              threshold={threshold}
              availableCollaborators={availableCollaborators}
              totalCollaborators={totalCollaborators}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingPage;
