import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";



export async function PATCH(req: Request, { params }: { params: { regionalId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { regionalId } = params;
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const regional = await db.regional.update({
            where: {
                id: regionalId,
            },
            data: {
                ...values
            }
        })

        return NextResponse.json(regional)

    } catch (error) {
        console.log("[REGIONAL_PATCH]", error)
        return new NextResponse("Internal Errorr " + error, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { regionalId: string } }) {

    try {
        const session = await getServerSession(authOptions)
        const { regionalId } = params;

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        if (!regionalId) return new NextResponse("Not Found", { status: 404 })

        const regionalDeleted = await db.regional.update({
            where: {
                id: regionalId,
            },
            data: {
                active: false,
            },
        })

        await db.city.updateMany({
            where: { regionalId },
            data: { regionalId: null },
          });

        return NextResponse.json(regionalDeleted)

    } catch (error) {
        console.log("[DELETED_ID_REGIONAL]", error)
        return new NextResponse("Internal Errorr " + error, { status: 500 })
    }
}