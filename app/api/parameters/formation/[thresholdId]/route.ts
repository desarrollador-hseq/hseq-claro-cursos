import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth-options"





export async function PATCH(req: Request, { params }: { params: { thresholdId: string } }) {
    const session = await getServerSession(authOptions)
    try {
        const { thresholdId } = params;
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const course = await db.formationParameters.update({
            where: {
                id: thresholdId,
            },
            data: {
                ...values
            }
        })

        return NextResponse.json(course)

    } catch (error) {
        console.log("[FORMATION_THRESHOLD_ID]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}