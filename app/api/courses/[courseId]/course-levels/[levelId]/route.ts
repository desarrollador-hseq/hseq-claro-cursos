import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { courseId: string, levelId: string} }) {
    const session = await getServerSession(authOptions)
    try {
        if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 })
        const values = await req.json()

        const courses = await db.courseLevel.update({
            where: {
                id: params.levelId
            },
            data: {
                ...values
            }

        })

        return NextResponse.json(courses)

    } catch (error) {
        console.log("[INSPECTION-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }

}


export async function DELETE(req: Request, { params }: { params: { levelId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { levelId } = params;

        if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 })

        const deactivateLevels = await db.courseLevel.update({
            where: {
                id: levelId,
            },
            data: {
                active: false
            }
        })


        return NextResponse.json(deactivateLevels)

    } catch (error) {
        console.log("[COURSELEVEL-DELETE]", error)
        return new NextResponse("Internal Errorr" + error, { status: 500 })
    }
}
