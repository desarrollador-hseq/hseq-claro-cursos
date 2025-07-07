import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { docId: string } }
) {
  try {
    const { docId } = params;

    const collaborator = await db.collaborator.findFirst({
      where: {
        numDoc: docId,
        active: true,
      },
      include: {
        certificates: {
          where: {
            active: true,
          },
        },
        cetarCertificates: {
          where: {
            active: true,
          },
          include: {
            training: true,
            courseLevel: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    // Combinar certificados regulares y CETAR
    if (collaborator) {
      const cetarCertificatesFormatted = collaborator.cetarCertificates.map((cc) => ({
        id: cc.id,
        type: "cetar",
        certificateUrl: cc.certificateUrl,
        collaboratorId: cc.collaboratorId,
        courseLevelId: cc.courseLevelId,
        createdAt: cc.createdAt,
        updatedAt: cc.updatedAt,
        active: cc.active,
        // Estructura compatible con certificados regulares
        courseName: cc.courseLevel.course.name,
        levelName: cc.courseLevel.name,
        certificateDate: cc.certificateDate,
        expeditionDate: cc.expeditionDate,
        dueDate: cc.dueDate,
        collaboratorFullname: cc.collaboratorFullname,
        collaboratorNumDoc: cc.collaboratorNumDoc,
        collaboratorTypeDoc: cc.collaboratorTypeDoc,
      }));

      return NextResponse.json({
        ...collaborator,
        certificates: [...collaborator.certificates, ...cetarCertificatesFormatted],
      });
    }

    return NextResponse.json(collaborator);
  } catch (error) {
    console.log("[GET_COLLABORATOR_CERTIFICATE]", error);
    return new NextResponse("Internal Errorr", { status: 500 });
  }
}
