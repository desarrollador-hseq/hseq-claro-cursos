import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import { DocType } from "@prisma/client";

// Enum EppType (mientras se regenera Prisma)
enum EppType {
  ARNES_CUERPO_COMPLETO = "ARNES_CUERPO_COMPLETO",
  ESLINGA_DOBLE_TERMINAL_EN_Y = "ESLINGA_DOBLE_TERMINAL_EN_Y",
  ESLINGA_POSICIONAMIENTO = "ESLINGA_POSICIONAMIENTO",
  FRENO_ARRESTADOR_CABLE = "FRENO_ARRESTADOR_CABLE",
  MOSQUETON = "MOSQUETON",
  ANCLAJE_TIPO_TIE_OFF = "ANCLAJE_TIPO_TIE_OFF"
}

interface EppEquipment {
  id: string;
  eppType: string;
  eppName: string;
  brand: string;
  model: string;
  serialNumber: string;
  manufacturingDate?: Date; // Agregar fecha de fabricación
  isSuitable: boolean;
  observations: string;
  inspectionAnswers: Record<string, any>;
}

interface InspectionFormData {
  collaboratorName: string;
  collaboratorLastName: string;
  collaboratorNumDoc: string;
  collaboratorTypeDoc: string;
  inspectorName: string;
  inspectionDate: Date;

  city: string;
  regional: string;
  position: string;
  equipment: EppEquipment[];
}

export async function POST(req: Request) {
  try {
    // const session = await getServerSession(authOptions);

    // if (!session) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const formData: InspectionFormData = await req.json();

    if (!formData.equipment || formData.equipment.length === 0) {
      return new NextResponse("No equipment provided", { status: 400 });
    }

    const results = {
      success: true,
      totalEquipment: formData.equipment.length,
      processed: 0,
      errors: [] as string[]
    };

    // Procesar cada equipo en una transacción
    for (const equipment of formData.equipment) {
      try {
        await db.$transaction(async (tx) => {
          // Validar que el inspector exista en Coach
          // const coach = await tx.coach.findFirst({
          //   where: {
          //     fullname: { contains: formData.inspectorName }
          //   }
          // });

          // if (!coach) {
          //   throw new Error(`Inspector "${formData.inspectorName}" no encontrado`);
          // }

          // Validar que la regional exista
          const regional = await tx.regional.findFirst({
            where: {
              name: { contains: formData.regional }
            }
          });

          if (!regional) {
            throw new Error(`Regional "${formData.regional}" no encontrada`);
          }

          // Buscar ciudad en la regional correspondiente
          // const city = await tx.city.findFirst({
          //   where: {
          //     AND: [
          //       {
          //         OR: [
          //           { formated: { contains: formData.city } },
          //           { realName: { contains: formData.city } }
          //         ]
          //       },
          //       { regionalId: regional.id }
          //     ]
          //   }
          // });

          // if (!city) {
          //   throw new Error(`Ciudad "${formData.city}" no encontrada en la regional "${formData.regional}"`);
          // }

          // Validar tipo de EPP
          const eppType = equipment.eppType as EppType;
          if (!Object.values(EppType).includes(eppType)) {
            throw new Error(`Tipo de EPP "${equipment.eppType}" no válido`);
          }

          // Validar tipo de documento
          const docType = formData.collaboratorTypeDoc as DocType;
          if (!Object.values(DocType).includes(docType)) {
            throw new Error(`Tipo de documento "${formData.collaboratorTypeDoc}" no válido`);
          }

          // Obtener preguntas desde la base de datos para este tipo de EPP
          const questions = await tx.eppInspectionQuestion.findMany({
            where: {
              eppType: eppType,
              active: true
            },
            select: {
              questionCode: true,
              questionText: true,
              category: true
            }
          });

          // Crear mapa de preguntas para lookup rápido
          const questionMap = new Map(
            questions.map((q: any) => [q.questionCode, q])
          );

          // Crear registro principal de inspección
          const inspection = await tx.eppCertificationInspection.create({
            data: {
              inspectionDate: new Date(formData.inspectionDate),
              certificationDate: new Date(formData.inspectionDate), // Misma fecha
              collaboratorName: `${formData.collaboratorName} ${formData.collaboratorLastName}`.trim(),
              collaboratorNumDoc: formData.collaboratorNumDoc || "",
              collaboratorTypeDoc: docType,
              collaboratorCityName: formData.city,
              eppType: eppType,
              eppName: equipment.eppName,
              eppSerialNumber: equipment.serialNumber,
              eppBrand: equipment.brand,
              eppModel: equipment.model || "",
              manufacturingDate: equipment.manufacturingDate ? new Date(equipment.manufacturingDate) : null, // Guardar fecha de fabricación
              // inspectorName: coach.fullname,
              inspectorName: formData.inspectorName,
              isSuitable: equipment.isSuitable,
              status: 'PENDING', // Initial status
              observations: equipment.observations || null,
              regionalId: regional.id,
              cityName: formData.city,
              // Resumen JSON con todas las respuestas y metadatos
              inspectionSummary: {
                totalQuestions: Object.keys(equipment.inspectionAnswers || {}).length,
                answeredQuestions: Object.values(equipment.inspectionAnswers || {}).filter(a => a).length,
                overallStatus: equipment.isSuitable ? 'apto' : 'no_apto',
                position: formData.position || '',
                // Respuestas completas con metadatos desde la base de datos
                responses: Object.entries(equipment.inspectionAnswers || {})
                  .filter(([_, answer]) => answer)
                  .map(([questionCode, answer]) => {
                    const questionData = questionMap.get(questionCode);
                    return {
                      answer: answer as string,
                      questionText: questionData?.questionText || questionCode,
                      category: questionData?.category || 'General'
                    };
                  }),

                categories: (() => {
                  const categoriesMap: Record<string, string> = {};
                  Object.entries(equipment.inspectionAnswers || {}).forEach(([questionCode, answer]) => {
                    const questionData = questionMap.get(questionCode);
                    const category = questionData?.category || 'General';
                    if (!categoriesMap[category]) {
                      categoriesMap[category] = "B"; // Valor por defecto "Bueno"
                    }
                  });
                  return Object.entries(categoriesMap).map(([category, value]) => ({
                    [category]: value
                  }));
                })()
              },
            }
          });

          // Las respuestas se almacenan en el campo JSON inspectionSummary
          // No creamos registros individuales en EppInspectionDetail para optimizar rendimiento
        });

        results.processed++;

      } catch (error) {
        console.error(`Error procesando equipo ${equipment.eppName}:`, error);
        results.errors.push(`${equipment.eppName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        results.success = false;
      }
    }

    if (results.success) {
      return NextResponse.json({
        success: true,
        message: `Se procesaron exitosamente ${results.processed} equipos EPP`,
        details: results
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Se procesaron ${results.processed} de ${results.totalEquipment} equipos`,
        errors: results.errors,
        details: results
      }, { status: 207 }); // Multi-status
    }

  } catch (error) {
    console.error("[EPP_INSPECTION_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Eliminamos las funciones hardcodeadas ya que ahora consultamos la base de datos
// function getQuestionText(...) - REMOVIDO
// function getQuestionCategory(...) - REMOVIDO

