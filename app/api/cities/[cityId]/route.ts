import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";



export async function PATCH(req: Request, { params }: { params: { cityId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { cityId } = params;
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        const city = await db.city.update({
            where: {
                id: cityId,
            },
            data: {
                ...values
            }
        })

        return NextResponse.json(city)

    } catch (error) {
        console.log("[CITY_PATCH]", error)
        return new NextResponse("Internal Errorr " + error, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { cityId: string } }) {

    try {
        const session = await getServerSession(authOptions)
        const { cityId } = params;

        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        if (!cityId) return new NextResponse("Not Found", { status: 404 })

        const cityDeleted = await db.city.update({
            where: {
                id: cityId,
            },
            data: {
                active: false
            }

        })

        return NextResponse.json(cityDeleted)

    } catch (error) {
        console.log("[DELETED_ID_CITY]", error)
        return new NextResponse("Internal Errorr " + error, { status: 500 })
    }
}