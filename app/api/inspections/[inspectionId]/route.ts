import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options"



export async function PATCH(req: Request, { params }: { params: { inspectionId: string } }) {
    try {
        const session = await getServerSession(authOptions)
        const { inspectionId } = params;
        const values = await req.json()

        if (!session) return new NextResponse("Unauthorized", { status: 401 })

        let report = null;

        const inspection = await db.inspection.update({
            where: {
                id: inspectionId,
            },
            data: {
                ...values
            }
        })

        if (inspection.isExecuted) {
            report = await db.report.create({
                data: {
                    deliveryDate: inspection.date,
                    inspectionId: inspection.id
                }
            })
        } else {
            const deleteReportResult = await db.report.deleteMany({
                where: {
                    inspectionId: inspection.id
                }
            });
            if (deleteReportResult.count > 0) {
                report = { message: 'Informe eliminado correctamente' };
            }
        }

        return NextResponse.json({ inspection, report });

    } catch (error) {
        console.log("[INSPECTIONS_UPDATED_ID]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { inspectionId: string } }) {

    try {
        const session = await getServerSession(authOptions)
        const { inspectionId } = params;
        let report = null;
       
        if (!session) return new NextResponse("Unauthorized", { status: 401 })
        if (!inspectionId) return new NextResponse("Not Found", { status: 404 })

        const inspectionDeleted = await db.inspection.delete({
            where: {
                id: inspectionId,
            },
        })

        const deleteReportResult = await db.report.deleteMany({
            where: {
                inspectionId: inspectionId
            }
        });
        if (deleteReportResult.count > 0) {
            report = { message: 'Informe eliminado correctamente' };
        }

        return NextResponse.json({inspectionDeleted, report})

    } catch (error) {
        console.log("[DELETED_ID_INSPECTION]", error)
        return new NextResponse("Internal Errorr", { status: 500 })
    }
}