

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { processAndDeleteFile, processAndUploadFile } from "@/lib/uploadFile";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";

export async function POST(req: Request, { params }: { params: { monthlyId: string } }) {
    const session = await getServerSession(authOptions)
    try {
        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        const monthlyReport = await db.monthlyReports.findUnique({
            where: {
                id: params.monthlyId
            }
        })
        if (!monthlyReport) return new NextResponse("Informe mensual no encontrado", { status: 404 })

        const { file, url, error, field, ubiPath } = await processAndUploadFile(req);

        if (error) {
            return new NextResponse(error.toString(), { status: 400 });
        }
        if (!file) {
            return new NextResponse("Archivo no encontrado", { status: 400 });
        }
        const urlFile = monthlyReport[field as keyof typeof monthlyReport] as string


        await processAndDeleteFile(ubiPath, urlFile)


        const monthlyReportUpdated = await db.monthlyReports.update({
            where: {
                id: monthlyReport.id
            },
            data: {
                [field]: url
            }
        })


        return NextResponse.json({
            collaborator: monthlyReportUpdated
        })
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Errorr: " + error, { status: 500 })
    }
}
