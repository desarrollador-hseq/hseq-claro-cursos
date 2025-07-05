

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"


export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    try {
        const values = await req.json()

        if(!session) return new NextResponse("Unauthorized", {status: 401})

        const regional = await db.regional.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(regional)
        
    } catch (error) {
        console.log("[REGIONAL-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}