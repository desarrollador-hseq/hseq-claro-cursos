import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";
import { EppInspectionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
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

export async function PATCH(req: Request, { params }: { params: { eppCertificationId: string } }) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { eppCertificationId } = params;
        const { ...values } = await req.json();

        const updatedEppCertification = await db.eppCertificationInspection.update({
            where: {
                id: eppCertificationId,
            },
            data: {
                ...values,
            },
        });

        return NextResponse.json(updatedEppCertification);
    } catch (error) {
        console.error("[EPP_CERTIFICATIONS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

