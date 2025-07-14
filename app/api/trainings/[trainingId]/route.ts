import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const training = await db.training.findUnique({
      where: {
        id: params.trainingId,
        active: true,
      },
      include: {
        course: {
          include: {
            courseLevels: {
              include: {
                requiredDocuments: true
              }
            }
          }
        },
        coach: true,
        trainingCollaborators: {
          include: {
            collaborator: {
              include: {
                city: {
                  include: {
                    regional: true
                  }
                }
              }
            },
            courseLevel: {
              include: {
                requiredDocuments: true
              }
            },
            documents: {
              include: {
                requiredDocument: true
              }
            }
          }
        }
      },
    });

    if (!training) {
      return new NextResponse("Training not found", { status: 404 });
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error("[TRAINING_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { code, courseId, startDate, endDate, location, instructor, coachId, maxCapacity, status } = body;

    const training = await db.training.update({
      where: {
        id: params.trainingId,
      },
      data: {
        ...(code && { code }),
        ...(courseId && { courseId }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(location !== undefined && { location }),
        ...(instructor !== undefined && { instructor }),
        ...(coachId !== undefined && { coachId }),
        ...(maxCapacity !== undefined && { maxCapacity: maxCapacity ? parseInt(maxCapacity) : null }),
        ...(status && { status }),
      },
      include: {
        course: true,
        coach: true,
        trainingCollaborators: {
          include: {
            collaborator: true,
            courseLevel: true
          }
        }
      }
    });

    return NextResponse.json(training);
  } catch (error) {
    console.error("[TRAINING_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { trainingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.training.update({
      where: {
        id: params.trainingId,
      },
      data: {
        active: false,
      },
    });

    return NextResponse.json({ message: "Training deleted successfully" });
  } catch (error) {
    console.error("[TRAINING_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 