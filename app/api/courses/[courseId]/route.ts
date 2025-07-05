import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";



export async function PATCH(req: Request, { params }: { params: { courseId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { courseId } = params;
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const course = await db.course.update({
            where: {
                id: courseId,
            },
            data: {
                ...values
            }
        })

        return NextResponse.json(course)

    } catch (error) {
        console.log("[COURSE_ID]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { courseId: string } }) {

    try {
        const session = await getServerSession(authOptions)
        const { courseId } = params;

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        if (!courseId) return new NextResponse("Not Found", { status: 404 })

        const courseDeleted = await db.course.delete({
            where: {
                id: courseId,
            },

        })

        return NextResponse.json(courseDeleted)

    } catch (error) {
        console.log("[DELETED_ID_COURSE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}