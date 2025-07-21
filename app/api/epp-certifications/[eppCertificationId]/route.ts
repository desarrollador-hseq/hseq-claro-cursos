import { db } from "@/lib/db";
import { EppInspectionStatus } from "@prisma/client";
import { NextResponse } from "next/server";




export async function GET(req: Request, { params }: { params: { eppCertificationId: string } }) {
    try {
        const { eppCertificationId } = params;

        const certification = await db.eppCertificationInspection.findUnique({
            where: {
                id: eppCertificationId,
            }
        });

        return NextResponse.json(certification);

    } catch (error) {
        console.error("[EPP_CERTIFICATIONS_GET_BY_ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
} 