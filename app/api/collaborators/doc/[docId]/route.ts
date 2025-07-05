import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { docId: string } }
) {
  try {
    const { docId } = params;

    const collaborator = await db.collaborator.findFirst({
      where: {
        numDoc: docId,
        active: true,
      },
      include: {
        certificates: {
          where: {
            active: true,
          },
        },
      },
    });

    return NextResponse.json(collaborator);
  } catch (error) {
    console.log("[GET_COLLABORATOR_CERTIFICATE]", error);
    return new NextResponse("Internal Errorr", { status: 500 });
  }
}
