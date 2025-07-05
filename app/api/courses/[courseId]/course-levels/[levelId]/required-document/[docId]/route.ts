
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: Request,
  { params }: { params: { levelId: string; docId: string } }
) {
  try {
    const documentRequired = await db.requiredDocument.findUnique({
      where: {
        id: params.docId,
        courseLevelId: params.levelId,
        active: true,
      },
    });

    return NextResponse.json(documentRequired);
  } catch (error) {
    console.log("[GET-DOCUMENTS-COURSELEVEL]", error);
    return new NextResponse("Internal Errorr", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { levelId: string; docId: string } }
) {
  const session = await getServerSession(authOptions);
  try {
    if (!session || session.user.role !== "ADMIN")
      return new NextResponse("Unauthorized", { status: 401 });
    const values = await req.json();

    const courses = await db.requiredDocument.update({
      where: {
        id: params.docId,
        courseLevelId: params.levelId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.log("[PATCH-DOCUMENTS-COURSELEVEL]", error);
    return new NextResponse("Internal Errorr", { status: 500 });
  }
}
export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; levelId: string; docId: string } }
) {
  const session = await getServerSession(authOptions);
  try {
    if (!session || session.user.role !== "ADMIN")
      return new NextResponse("Unauthorized", { status: 401 });


    const courses = await db.requiredDocument.update({
      where: {
        id: params.docId,
        courseLevelId: params.levelId,
      },
      data: {
        active: false
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.log("[PATCH-DOCUMENTS-COURSELEVEL]", error);
    return new NextResponse("Internal Errorr", { status: 500 });
  }
}
