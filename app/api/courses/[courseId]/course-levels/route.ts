


import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"




export async function GET(req: Request, { params }: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions)
    try {


        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const coursesLevel = await db.courseLevel.findMany({
            where: {
                courseId: params.courseId
            }
        })

        return NextResponse.json(coursesLevel)

    } catch (error) {
        console.log("[COURSE-LEVEL-GET]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}


export async function POST(req: Request, { params }: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions)
    try {
        if (!session || session.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 })
        if (!params.courseId) return new NextResponse("Bad request", { status: 400 })
        const values = await req.json()

        const courses = await db.courseLevel.create({
            data: {
                courseId: params.courseId,
                ...values
            }
        })
        return NextResponse.json(courses)
    } catch (error) {
        console.log("[COURSE-LEVEL-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }

}

