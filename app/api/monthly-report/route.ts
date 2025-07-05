import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth-options"



export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    try {
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const values = await req.json()
        if (!values) return new NextResponse("Bad Request", { status: 400 })

        const monthlyReports = await db.monthlyReports.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(monthlyReports)

    } catch (error) {
        console.log("[CREATE-MONTHLY-REPORT]", error)
        return new NextResponse("Internal Errorr" + error, { status: 500 })
    }
}