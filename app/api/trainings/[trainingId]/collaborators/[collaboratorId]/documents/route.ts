import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Obtener el TrainingCollaborator
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId
        }
      }
    });

    if (!trainingCollaborator) {
      return new NextResponse("Training collaborator not found", { status: 404 });
    }

    const documents = await db.trainingCollaboratorDocument.findMany({
      where: {
        trainingCollaboratorId: trainingCollaborator.id,
      },
      include: {
        requiredDocument: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("[TRAINING_COLLABORATOR_DOCUMENTS_GET]", error);
    return new NextResponse("Internal Error"+ error, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { trainingId: string; collaboratorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { requiredDocumentId, documentLink, fileName, fileSize } = body;

    if (!requiredDocumentId || !documentLink) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Obtener el TrainingCollaborator
    const trainingCollaborator = await db.trainingCollaborator.findUnique({
      where: {
        trainingId_collaboratorId: {
          trainingId: params.trainingId,
          collaboratorId: params.collaboratorId
        }
      }
    });

    if (!trainingCollaborator) {
      return new NextResponse("Training collaborator not found", { status: 404 });
    }

    // Verificar si ya existe un documento para este requirement
    const existingDocument = await db.trainingCollaboratorDocument.findUnique({
      where: {
        trainingCollaboratorId_requiredDocumentId: {
          trainingCollaboratorId: trainingCollaborator.id,
          requiredDocumentId: requiredDocumentId
        }
      }
    });

    if (existingDocument) {
      // Actualizar el documento existente
      const updatedDocument = await db.trainingCollaboratorDocument.update({
        where: {
          id: existingDocument.id
        },
        data: {
          documentLink,
          fileName: fileName || null,
          fileSize: fileSize ? parseInt(fileSize) : null,
          uploadedBy: session.user.id,
          status: "PENDING",
        },
        include: {
          requiredDocument: true,
        }
      });

      return NextResponse.json(updatedDocument);
    } else {
      // Crear nuevo documento
      const document = await db.trainingCollaboratorDocument.create({
        data: {
          trainingCollaboratorId: trainingCollaborator.id,
          requiredDocumentId,
          documentLink,
          fileName: fileName || null,
          fileSize: fileSize ? parseInt(fileSize) : null,
          uploadedBy: session.user.id,
        },
        include: {
          requiredDocument: true,
        }
      });

      return NextResponse.json(document);
    }
  } catch (error) {
    console.error("[TRAINING_COLLABORATOR_DOCUMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 