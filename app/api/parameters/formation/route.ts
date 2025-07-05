
import { getServerSession } from "next-auth"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth-options"



export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    try {


        if (!session) return new NextResponse("Unauthorized", { status: 401 })


        const threshold = await db.formationParameters.findFirst()

        return NextResponse.json(threshold)

    } catch (error) {
        console.log("[GET-THRESHOLD]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    try {
        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const values = await req.json()
        if (!values) return new NextResponse("Bad Request", { status: 400 })

        const threshold = await db.formationParameters.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(threshold)

    } catch (error) {
        console.log("[GET-THRESHOLD]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}