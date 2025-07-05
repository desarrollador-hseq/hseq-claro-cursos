

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"


export async function POST(req: Request, { params }: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions)
    try {
        const values = await req.json()

        if(!session) return new NextResponse("Unauthorized", {status: 401})

  

        const report = await db.report.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(report)
        
    } catch (error) {
        console.log("[REPORTS-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}