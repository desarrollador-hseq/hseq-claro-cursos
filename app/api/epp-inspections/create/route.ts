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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
          const coach = await tx.coach.findFirst({
            where: {
              fullname: { contains: formData.inspectorName }
            }
          });

          if (!coach) {
            throw new Error(`Inspector "${formData.inspectorName}" no encontrado`);
          }

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
          const city = await tx.city.findFirst({
            where: {
              AND: [
                {
                  OR: [
                    { formated: { contains: formData.city } },
                    { realName: { contains: formData.city } }
                  ]
                },
                { regionalId: regional.id }
              ]
            }
          });

          if (!city) {
            throw new Error(`Ciudad "${formData.city}" no encontrada en la regional "${formData.regional}"`);
          }

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

          // Crear registro principal de inspección
          const inspection = await tx.eppCertificationInspection.create({
            data: {
              inspectionDate: new Date(formData.inspectionDate),
              certificationDate: new Date(formData.inspectionDate), // Misma fecha
              collaboratorName: `${formData.collaboratorName} ${formData.collaboratorLastName}`.trim(),
              collaboratorNumDoc: formData.collaboratorNumDoc || "",
              collaboratorTypeDoc: docType,
              collaboratorCityName: city.realName,
              eppType: eppType,
              eppName: equipment.eppName,
              eppSerialNumber: equipment.serialNumber,
              eppBrand: equipment.brand,
              eppModel: equipment.model || "",
              inspectorName: coach.fullname,
              isSuitable: equipment.isSuitable,
              status: 'PENDING', // Initial status
              observations: equipment.observations || null,
              regionalId: regional.id,
              cityName: city.realName,
              // Resumen JSON con todas las respuestas y metadatos
              inspectionSummary: {
                totalQuestions: Object.keys(equipment.inspectionAnswers || {}).length,
                answeredQuestions: Object.values(equipment.inspectionAnswers || {}).filter(a => a).length,
                overallStatus: equipment.isSuitable ? 'apto' : 'no_apto',
                position: formData.position || '',
                // Respuestas completas con metadatos
                responses: Object.entries(equipment.inspectionAnswers || {})
                  .filter(([_, answer]) => answer)
                  .map(([questionCode, answer]) => ({
                    answer: answer as string,
                    questionText: getQuestionText(equipment.eppType, questionCode),
                    category: getQuestionCategory(equipment.eppType, questionCode)
                  }))
              }
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

// Funciones auxiliares para obtener metadatos de preguntas
function getQuestionText(eppType: string, questionCode: string): string {
  const questionMaps: Record<string, Record<string, string>> = {
    "ARNES_CUERPO_COMPLETO": {
      "quemaduras": "¿Presenta quemaduras?",
      "decoloracion": "¿Presenta decoloración?",
      "manchas_quimicos": "¿Presenta manchas de químicos?",
      "costuras_sueltas": "¿Presenta costuras sueltas?",
      "desgaste_abrasion": "¿Presenta desgaste por abrasión?",
      "fibras_rotas": "¿Presenta fibras rotas?",
      "cristalizacion": "¿Presenta cristalización?",
      "rigidez_correa": "¿Presenta rigidez en la correa o cuerda?",
      "presencia_moho": "¿Presenta presencia de moho?",
      "agujeros_perforaciones": "¿Presenta agujeros o perforaciones?",
      "corrosion": "¿Presenta corrosión?",
      "deformacion": "¿Presenta deformación?",
      "argollas_hebillas_quiebres": "¿Las argollas o hebillas presentan quiebres o fracturas?",
      "conexion_adecuada_argollas": "¿La conexión es adecuada (Argollas y hebillas)?",
      "seguros_adecuados": "¿Los seguros son adecuados?"
    },
    "ESLINGA_DOBLE_TERMINAL_EN_Y": {
      "quemaduras2": "¿Presenta quemaduras?",
      "decoloracion2": "¿Presenta decoloración?",
      "manchas_quimicos2": "¿Presenta manchas de químicos?",
      "costuras_sueltas2": "¿Presenta costuras sueltas?",
      "desgaste_abrasion2": "¿Presenta desgaste por abrasión?",
      "fibras_rotas2": "¿Presenta fibras rotas?",
      "cristalizacion2": "¿Presenta cristalización?",
      "rigidez_correa2": "¿Presenta rigidez en la correa o cuerda?",
      "presencia_moho2": "¿Presenta presencia de moho?",
      "agujeros_perforaciones2": "¿Presenta agujeros o perforaciones?",
      "corrosion2": "¿Presenta corrosión?",
      "deformacion2": "¿Presenta deformación?",
      "argollas_hebillas_quiebres2": "¿Las argollas o hebillas presentan quiebres o fracturas?",
      "conexion_adecuada_argollas2": "¿La conexión es adecuada (Argollas y hebillas)?",
      "ganchos_cierre_automatico": "¿Los ganchos tienen cierre automático?",
      "seguros_adecuados2": "¿Los seguros son adecuados?",
      "indicador_impacto_activado": "¿El indicador de impacto está activado?",
      "absorbedor_activado": "¿El absorbedor está activado?"
    },
    "ESLINGA_POSICIONAMIENTO": {
      "quemaduras3": "¿Presenta quemaduras?",
      "decoloracion3": "¿Presenta decoloración?",
      "manchas_quimicos3": "¿Presenta manchas de químicos?",
      "costuras_sueltas3": "¿Presenta costuras sueltas?",
      "desgaste_abrasion3": "¿Presenta desgaste por abrasión?",
      "fibras_rotas3": "¿Presenta fibras rotas?",
      "cristalizacion3": "¿Presenta cristalización?",
      "rigidez_correa3": "¿Presenta rigidez en la correa o cuerda?",
      "presencia_moho3": "¿Presenta presencia de moho?",
      "agujeros_perforaciones3": "¿Presenta agujeros o perforaciones?",
      "corrosion3": "¿Presenta corrosión?",
      "deformacion3": "¿Presenta deformación?",
      "argollas_hebillas_quiebres3": "¿Las argollas o hebillas presentan quiebres o fracturas?",
      "conexion_adecuada_argollas3": "¿La conexión es adecuada (Argollas y hebillas)?",
      "ganchos_cierre_automatico2": "¿Los ganchos tienen cierre automático?",
      "seguros_adecuados3": "¿Los seguros son adecuados?"
    },
    "FRENO_ARRESTADOR_CABLE": {
      "corrosion4": "¿Presenta corrosión?",
      "deformacion4": "¿Presenta deformación?",
      "argollas_quiebres_fracturas": "¿Las argollas presentan quiebres o fracturas?",
      "conexion_adecuada": "¿La conexión es adecuada?",
      "seguros_adecuados4": "¿Los seguros son adecuados?"
    },
    "MOSQUETON": {
      "corrosion5": "¿Presenta corrosión?",
      "deformacion5": "¿Presenta deformación?",
      "argollas_quiebres_fracturas2": "¿Las argollas presentan quiebres o fracturas?",
      "conexion_adecuada2": "¿La conexión es adecuada?",
      "seguros_adecuados5": "¿Los seguros son adecuados?"
    },
    "ANCLAJE_TIPO_TIE_OFF": {
      "quemaduras4": "¿Presenta quemaduras?",
      "decoloracion4": "¿Presenta decoloración?",
      "manchas_quimicos4": "¿Presenta manchas de químicos?",
      "costuras_sueltas4": "¿Presenta costuras sueltas?",
      "desgaste_abrasion4": "¿Presenta desgaste por abrasión?",
      "fibras_rotas4": "¿Presenta fibras rotas?",
      "cristalizacion4": "¿Presenta cristalización?",
      "rigidez_correa4": "¿Presenta rigidez en la correa o cuerda?",
      "presencia_moho4": "¿Presenta presencia de moho?",
      "agujeros_perforaciones4": "¿Presenta agujeros o perforaciones?",
      "corrosion6": "¿Presenta corrosión?",
      "deformacion6": "¿Presenta deformación?",
      "argollas_quiebres_fracturas_final": "¿Las argollas presentan quiebres o fracturas?",
      "conexion_adecuada_segura": "¿Permite conectarse de forma segura el equipo?"
    }
  };

  return questionMaps[eppType]?.[questionCode] || questionCode;
}

function getQuestionCategory(eppType: string, questionCode: string): string {
  if (questionCode.includes('quemaduras') || questionCode.includes('decoloracion') || questionCode.includes('manchas')) {
    return 'Inspección Visual';
  }
  if (questionCode.includes('costuras') || questionCode.includes('fibras') || questionCode.includes('deformacion') || questionCode.includes('agujeros') || questionCode.includes('perforaciones')) {
    return 'Inspección Estructural';
  }
  if (questionCode.includes('corrosion')) {
    return 'Inspección Corrosión';
  }
  if (questionCode.includes('cristalizacion')) {
    return 'Inspección Material';
  }
  if (questionCode.includes('rigidez')) {
    return 'Inspección Flexibilidad';
  }
  if (questionCode.includes('moho')) {
    return 'Inspección Contaminación';
  }
  if (questionCode.includes('argollas') || questionCode.includes('hebillas') || questionCode.includes('ganchos')) {
    return 'Inspección Hardware';
  }
  if (questionCode.includes('conexion')) {
    return 'Inspección Conexión';
  }
  if (questionCode.includes('indicador') || questionCode.includes('absorbedor') || questionCode.includes('seguros')) {
    return 'Inspección Seguridad';
  }
  return 'General';
}

