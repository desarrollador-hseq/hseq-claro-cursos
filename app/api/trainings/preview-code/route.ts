import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Generar un número aleatorio de 6 dígitos para el preview
    const randomNumber = Math.floor(Math.random() * 900000) + 100000;
    const previewCode = randomNumber.toString();

    return NextResponse.json({ 
      previewCode,
      format: "6 dígitos aleatorios",
      note: "Se generará un código único de 6 dígitos automáticamente"
    });
  } catch (error) {
    console.error("[TRAINING_PREVIEW_CODE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 