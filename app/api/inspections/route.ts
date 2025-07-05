

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"


export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    try {
        const values = await req.json()

        if(!session) return new NextResponse("Unauthorized", {status: 401})

        const inspection = await db.inspection.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(inspection)
        
    } catch (error) {
        console.log("[INSPECTION-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}