import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { checkApiPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const trainings = await db.training.findMany({
      where: {
        active: true,
      },
      include: {
        course: {
          include: {
            courseLevels: true
          }
        },
        coach: true,
        trainingCollaborators: {
          include: {
            collaborator: true,
            courseLevel: true
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(trainings);
  } catch (error) {
    console.error("[TRAININGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Función para generar código único de capacitación (6 dígitos aleatorios)
async function generateUniqueTrainingCode(): Promise<string> {
  let code: string;
  let existingTraining;
  let attempts = 0;
  const maxAttempts = 100; // Prevenir bucle infinito

  do {
    // Generar número aleatorio de 6 dígitos (100000 - 999999)
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    code = randomNumber.toString();

    // Verificar si el código ya existe
    existingTraining = await db.training.findUnique({
      where: { code }
    });

    attempts++;
  } while (existingTraining && attempts < maxAttempts);

  // Si después de 100 intentos no encontramos un código único, usar timestamp
  if (existingTraining) {
    const timestamp = Date.now().toString();
    code = timestamp.slice(-6); // Últimos 6 dígitos del timestamp
  }

  return code;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // COORDINATOR y ADMIN pueden crear capacitaciones
    if (!session || !checkApiPermission(session.user.role as any, "MANAGE_TRAININGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { courseId, startDate, endDate, location, instructor, coachId, maxCapacity, byCetar } = body;

    if (!courseId) {
      console.log("Missing courseId");
      return new NextResponse("Missing courseId", { status: 400 });
    }

    if (!startDate) {
      console.log("Missing startDate");
      return new NextResponse("Missing startDate", { status: 400 });
    }

    if (!endDate) {
      console.log("Missing endDate");
      return new NextResponse("Missing endDate", { status: 400 });
    }

    const code = await generateUniqueTrainingCode();
    console.log({ code });

    const training = await db.training.create({
      data: {
        code,
        courseId,
        startDate,
        endDate,
        location,
        instructor,
        coachId: coachId || null,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
        byCetar: byCetar || false,
      },
      include: {
        course: {
          include: {
            courseLevels: true
          }
        },
        coach: true
      }
    });

    return NextResponse.json(training);
  } catch (error) {
    console.error("[TRAININGS_POST]", error);
    return new NextResponse("Internal Error" + error, { status: 500 });
  }
} 