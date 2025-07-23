

import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth-options"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const city = searchParams.get("city") || undefined;
    const regional = searchParams.get("regional") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const where: any = {
        active: true,
        AND: [] as any[],
    };
    if (search) {
        where.AND.push({
            OR: [
                { name: { contains: search } },
                { lastname: { contains: search } },
                { numDoc: { contains: search } },
            ],
        });
    }
    if (city) {
        where.AND.push({ cityId: city });
    }
    if (regional) {
        where.AND.push({ city: { regionalId: regional } });
    }

    const total = await db.collaborator.count({ where });
    const data = await db.collaborator.findMany({
        where,
        include: {
            city: { include: { regional: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: "asc" },
    });

    return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: Request, { params }: { params: { courseId: string } }) {
    const session = await getServerSession(authOptions)
    try {
        const values = await req.json()

        if(!session) return new NextResponse("Unauthorized", {status: 401})

        const existingCollaborator = await db.collaborator.findFirst({
            where: { numDoc: values.numDoc, active: true}
        });
        
        if (existingCollaborator) {
            return new NextResponse("there is already a collaborator with this document", { status: 400 });
        }
        

        const collaborator = await db.collaborator.create({
            data: {
                ...values
            }
        })

        return NextResponse.json(collaborator)
        
    } catch (error) {
        console.log("[COLLABORATOR-CREATE]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}