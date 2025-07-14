import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { db } from "@/lib/db";



export async function PATCH(req: Request, { params }: { params: { cetarId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { cetarId } = params;
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const cetar = await db.cetar.update({
            where: {
                id: cetarId,
            },
            data: {
                ...values
            }
        })

        return NextResponse.json(cetar)

    } catch (error) {
        console.log("[CETAR_ID]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { cetarId: string } }) {

    try {
        const session = await getServerSession(authOptions)
        const { cetarId } = params;

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        if (!cetarId) return new NextResponse("Not Found", { status: 404 })

        const cetarDeleted = await db.cetar.delete({
            where: {
                id: cetarId,
            },

        })

        return NextResponse.json(cetarDeleted)

    } catch (error) {
        console.log("[DELETED_ID_CETAR]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}