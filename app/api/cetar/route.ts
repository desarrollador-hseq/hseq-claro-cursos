import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"


export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    try {
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const cetar = await db.cetar.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(cetar)

    } catch (error) {
        console.log("[CETAR-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}