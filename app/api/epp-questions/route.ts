import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eppType = searchParams.get('eppType');

    if (!eppType) {
      return NextResponse.json({ error: "eppType parameter is required" }, { status: 400 });
    }

    const questions = await db.eppInspectionQuestion.findMany({
      where: {
        eppType: eppType as any, // Cast to EppType enum
        active: true
      },
      select: {
        id: true,
        questionCode: true,
        questionText: true,
        category: true,
        isRequired: true,
        displayOrder: true,
        answerType: true,
        helpText: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    });

    return NextResponse.json({ questions });

  } catch (error) {
    console.error("[EPP_QUESTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 