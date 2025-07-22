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

interface InspectionData {
  collaboratorName: string;
  collaboratorLastName: string;
  collaboratorNumDoc: string;
  collaboratorTypeDoc: string;
  city: string;
  regional: string;
  inspector: string;
  eppType: string;
  eppName: string;
  eppBrand: string;
  eppModel: string;
  eppSerialNumber: string;
  isSuitable: boolean;
  observations: string;
  inspectionDate: string | Date;
  certificationDate: string | Date;
  // Detalles de inspección específicos
  inspectionDetails?: Record<string, any>;
}

interface ApiError {
  inspeccion: InspectionData;
  error: string;
}

interface ProcessResult {
  exitoso: boolean;
  totalProcesados: number;
  exitosos: number;
  fallidos: number;
  errores: ApiError[];
}

// Mapeo de preguntas por tipo de EPP (basado en el formulario de Microsoft Forms)
// const EPP_QUESTIONS_MAP: Record<string, Array<{code: string, text: string, category: string}>> = {
//   "ARNES_CUERPO_COMPLETO": [
//     { code: "quemaduras", text: "¿Presenta quemaduras?", category: "visual" },
//     { code: "decoloracion", text: "¿Presenta decoloración?", category: "visual" },
//     { code: "manchas_quimicos", text: "¿Presenta manchas de químicos?", category: "visual" },
//     { code: "costuras_sueltas", text: "¿Presenta costuras sueltas?", category: "estructural" },
//     { code: "desgaste_abrasion", text: "¿Presenta desgaste por abrasión?", category: "estructural" },
//     { code: "fibras_rotas", text: "¿Presenta fibras rotas?", category: "estructural" },
//     { code: "cristalizacion", text: "¿Presenta cristalización?", category: "material" },
//     { code: "rigidez_correa", text: "¿Presenta rigidez en la correa o cuerda?", category: "flexibilidad" },
//     { code: "presencia_moho", text: "¿Presenta presencia de moho?", category: "contaminacion" },
//     { code: "agujeros_perforaciones", text: "¿Presenta agujeros o perforaciones?", category: "estructural" },
//     { code: "corrosion", text: "¿Presenta corrosión?", category: "corrosion" },
//     { code: "deformacion", text: "¿Presenta deformación?", category: "estructural" },
//     { code: "argollas_hebillas_quiebres", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "hardware" },
//     { code: "conexion_adecuada_argollas", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "conexion" },
//     { code: "seguros_adecuados", text: "¿Los seguros son adecuados?", category: "seguridad" }
//   ],
//   "ESLINGA_DOBLE_TERMINAL_EN_Y": [
//     { code: "quemaduras2", text: "¿Presenta quemaduras?", category: "visual" },
//     { code: "decoloracion2", text: "¿Presenta decoloración?", category: "visual" },
//     { code: "manchas_quimicos2", text: "¿Presenta manchas de químicos?", category: "visual" },
//     { code: "costuras_sueltas2", text: "¿Presenta costuras sueltas?", category: "estructural" },
//     { code: "desgaste_abrasion2", text: "¿Presenta desgaste por abrasión?", category: "estructural" },
//     { code: "fibras_rotas2", text: "¿Presenta fibras rotas?", category: "estructural" },
//     { code: "cristalizacion2", text: "¿Presenta cristalización?", category: "material" },
//     { code: "rigidez_correa2", text: "¿Presenta rigidez en la correa o cuerda?", category: "flexibilidad" },
//     { code: "presencia_moho2", text: "¿Presenta presencia de moho?", category: "contaminacion" },
//     { code: "agujeros_perforaciones2", text: "¿Presenta agujeros o perforaciones?", category: "estructural" },
//     { code: "corrosion2", text: "¿Presenta corrosión?", category: "corrosion" },
//     { code: "deformacion2", text: "¿Presenta deformación?", category: "estructural" },
//     { code: "argollas_hebillas_quiebres2", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "hardware" },
//     { code: "conexion_adecuada_argollas2", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "conexion" },
//     { code: "ganchos_cierre_automatico", text: "¿Los ganchos tienen cierre automático?", category: "hardware" },
//     { code: "seguros_adecuados2", text: "¿Los seguros son adecuados?", category: "seguridad" },
//     { code: "indicador_impacto_activado", text: "¿El indicador de impacto está activado?", category: "seguridad" },
//     { code: "absorbedor_activado", text: "¿El absorbedor está activado?", category: "seguridad" }
//   ],
//   "ESLINGA_POSICIONAMIENTO": [
//     { code: "quemaduras3", text: "¿Presenta quemaduras?", category: "visual" },
//     { code: "decoloracion3", text: "¿Presenta decoloración?", category: "visual" },
//     { code: "manchas_quimicos3", text: "¿Presenta manchas de químicos?", category: "visual" },
//     { code: "costuras_sueltas3", text: "¿Presenta costuras sueltas?", category: "estructural" },
//     { code: "desgaste_abrasion3", text: "¿Presenta desgaste por abrasión?", category: "estructural" },
//     { code: "fibras_rotas3", text: "¿Presenta fibras rotas?", category: "estructural" },
//     { code: "cristalizacion3", text: "¿Presenta cristalización?", category: "material" },
//     { code: "rigidez_correa3", text: "¿Presenta rigidez en la correa o cuerda?", category: "flexibilidad" },
//     { code: "presencia_moho3", text: "¿Presenta presencia de moho?", category: "contaminacion" },
//     { code: "agujeros_perforaciones3", text: "¿Presenta agujeros o perforaciones?", category: "estructural" },
//     { code: "corrosion3", text: "¿Presenta corrosión?", category: "corrosion" },
//     { code: "deformacion3", text: "¿Presenta deformación?", category: "estructural" },
//     { code: "argollas_hebillas_quiebres3", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "hardware" },
//     { code: "conexion_adecuada_argollas3", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "conexion" },
//     { code: "ganchos_cierre_automatico2", text: "¿Los ganchos tienen cierre automático?", category: "hardware" },
//     { code: "seguros_adecuados3", text: "¿Los seguros son adecuados?", category: "seguridad" }
//   ],
//   "FRENO_ARRESTADOR_CABLE": [
//     { code: "corrosion4", text: "¿Presenta corrosión?", category: "corrosion" },
//     { code: "deformacion4", text: "¿Presenta deformación?", category: "estructural" },
//     { code: "argollas_quiebres_fracturas", text: "¿Las argollas presentan quiebres o fracturas?", category: "hardware" },
//     { code: "conexion_adecuada", text: "¿La conexión es adecuada?", category: "conexion" },
//     { code: "seguros_adecuados4", text: "¿Los seguros son adecuados?", category: "seguridad" }
//   ],
//   "MOSQUETON": [
//     { code: "corrosion5", text: "¿Presenta corrosión?", category: "corrosion" },
//     { code: "deformacion5", text: "¿Presenta deformación?", category: "estructural" },
//     { code: "argollas_quiebres_fracturas2", text: "¿Las argollas presentan quiebres o fracturas?", category: "hardware" },
//     { code: "conexion_adecuada2", text: "¿La conexión es adecuada?", category: "conexion" },
//     { code: "seguros_adecuados5", text: "¿Los seguros son adecuados?", category: "seguridad" }
//   ],
//   "ANCLAJE_TIPO_TIE_OFF": [
//     { code: "quemaduras4", text: "¿Presenta quemaduras?", category: "visual" },
//     { code: "decoloracion4", text: "¿Presenta decoloración?", category: "visual" },
//     { code: "manchas_quimicos4", text: "¿Presenta manchas de químicos?", category: "visual" },
//     { code: "costuras_sueltas4", text: "¿Presenta costuras sueltas?", category: "estructural" },
//     { code: "desgaste_abrasion4", text: "¿Presenta desgaste por abrasión?", category: "estructural" },
//     { code: "fibras_rotas4", text: "¿Presenta fibras rotas?", category: "estructural" },
//     { code: "cristalizacion4", text: "¿Presenta cristalización?", category: "material" },
//     { code: "rigidez_correa4", text: "¿Presenta rigidez en la correa o cuerda?", category: "flexibilidad" },
//     { code: "presencia_moho4", text: "¿Presenta presencia de moho?", category: "contaminacion" },
//     { code: "agujeros_perforaciones4", text: "¿Presenta agujeros o perforaciones?", category: "estructural" },
//     { code: "corrosion6", text: "¿Presenta corrosión?", category: "corrosion" },
//     { code: "deformacion6", text: "¿Presenta deformación?", category: "estructural" },
//     { code: "argollas_quiebres_fracturas_final", text: "¿Las argollas presentan quiebres o fracturas?", category: "hardware" },
//     { code: "conexion_adecuada_segura", text: "¿Permite conectarse de forma segura el equipo?", category: "conexion" }
//   ]
// };

// Función para procesar respuestas del Excel a formato estructurado
function processInspectionAnswers(rawData: any, eppType: string): any[] {
  const answers: any[] = [];
  
  // Procesar todas las propiedades del rawData que contengan respuestas
  Object.entries(rawData).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && 
        !['ID', 'Hora de inicio', 'Hora de finalización', 'Correo electrónico', 'Nombre', 'Hora de la última modificación', 
          'Fecha', 'Nombre del inspector asignado (Entrenador que se encuentra desarrollando la formación)', 'Nombre2', 
          'Apellidos', 'Cargo', 'Ciudad', 'Regional', 'Marca', 'Lote', 'Serial', 'Fecha de fabricación',
          'Marca2', 'Lote2', 'Serial2', 'Fecha de fabricación2', 'Marca3', 'Lote3', 'Serial3', 'Fecha de fabricación3',
          'Marca4', 'Lote4', 'Serial4', 'Fecha de fabricación4', 'Marca5', 'Lote5', 'Serial5', 'Fecha de fabricación5',
          'Marca6', 'Lote6', 'Serial6', 'Fecha de fabricación6', 'Estado del equipo', 'Estado del equipo2', 
          'Estado del equipo3', 'Estado del equipo4', 'Estado del equipo5', 'Estado del equipo6',
          'Motivo del Rechazo', 'Motivo del Rechazo2', 'Motivo del Rechazo3', 'Motivo del Rechazo4',
          'Motivo del Rechazo5', 'Motivo del Rechazo6'].includes(key)) {
      
      answers.push({
        answer: normalizeAnswer(value),
        questionText: key, // Usar el nombre de la columna como texto de la pregunta
        category: getCategoryFromQuestionKey(key)
      });
    }
  });
  
  return answers;
}

// Función auxiliar para determinar la categoría basada en la clave de la pregunta
function getCategoryFromQuestionKey(key: string): string {
  // Componente textil - todas las inspecciones relacionadas con material textil
  if (key.includes('quemaduras') || key.includes('decoloracion') || key.includes('manchas_quimicos') ||
      key.includes('costuras_sueltas') || key.includes('desgaste_abrasion') || key.includes('fibras_rotas') ||
      key.includes('cristalizacion') || key.includes('rigidez_correa') || key.includes('presencia_moho') ||
      key.includes('agujeros_perforaciones')) {
    return 'Componente textil';
  }
  
  // Componente metálico - inspecciones de partes metálicas
  else if (key.includes('corrosion') || key.includes('deformacion') || key.includes('argollas_hebillas_quiebres') ||
           key.includes('argollas_quiebres_fracturas')) {
    return 'Componente metálico';
  }
  
  // Componente de funcionalidad - verificaciones de funcionamiento
  else if (key.includes('conexion_adecuada') || key.includes('seguros_adecuados') || 
           key.includes('ganchos_cierre_automatico')) {
    return 'Componente de funcionalidad';
  }
  
  // Componente de impacto - verificaciones específicas de absorbedores
  else if (key.includes('indicador_impacto_activado') || key.includes('absorbedor_activado')) {
    return 'Componente de impacto';
  }
  
  // Categoría por defecto
  return 'Componente de funcionalidad';
}

// Normalizar respuestas a formato estándar
function normalizeAnswer(rawAnswer: any): string {
  if (typeof rawAnswer === 'string') {
    const normalized = rawAnswer.toLowerCase().trim();
    if (['si', 'sí', 'yes', '1', 'true'].includes(normalized)) return 'Si';
    if (['no', 'n', '0', 'false'].includes(normalized)) return 'No';
    if (['n/a', 'na', 'no aplica'].includes(normalized)) return 'N/A';
  }
  return String(rawAnswer).trim();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { inspections, fileName } = await req.json();

    if (!inspections || !Array.isArray(inspections)) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    const result: ProcessResult = {
      exitoso: false,
      totalProcesados: inspections.length,
      exitosos: 0,
      fallidos: 0,
      errores: []
    };

    // Procesar cada inspección en una transacción para mejor rendimiento
    for (const inspectionData of inspections) {
      try {
        await db.$transaction(async (tx) => {
          // Validaciones previas...
          const eppType = inspectionData.eppType as EppType;
          const docType = inspectionData.collaboratorTypeDoc as DocType;
          
          // Validar coach
          const coach = await tx.coach.findFirst({
            where: {
              fullname: { contains: inspectionData.inspector }
            }
          });

          if (!coach) {
            throw new Error(`Inspector "${inspectionData.inspector}" no encontrado`);
          }

          // Validar regional
          const regional = await tx.regional.findFirst({
            where: {
              name: { contains: inspectionData.regional }
            }
          });

          if (!regional) {
            throw new Error(`Regional "${inspectionData.regional}" no encontrada`);
          }
          
          // Buscar ciudad
          const city = await tx.city.findFirst({
            where: {
              AND: [
                {
                  OR: [
                    { formated: { contains: inspectionData.city } },
                    { realName: { contains: inspectionData.city } }
                  ]
                },
                { regionalId: regional.id }
              ]
            }
          });

          if (!city) {
            throw new Error(`Ciudad "${inspectionData.city}" no encontrada en la regional "${inspectionData.regional}"`);
          }

          // Crear registro principal de inspección
          const inspection = await tx.eppCertificationInspection.create({
            data: {
              inspectionDate: new Date(inspectionData.inspectionDate),
              certificationDate: new Date(inspectionData.certificationDate),
              collaboratorName: `${inspectionData.collaboratorName} ${inspectionData.collaboratorLastName}`.trim(),
              collaboratorNumDoc: inspectionData.collaboratorNumDoc || "",
              collaboratorTypeDoc: docType,
              collaboratorCityName: city.realName,
              eppType: eppType,
              eppName: inspectionData.eppName,
              eppSerialNumber: inspectionData.eppSerialNumber,
              eppBrand: inspectionData.eppBrand,
              eppModel: inspectionData.eppModel || "",
              inspectorName: coach.fullname,
              isSuitable: inspectionData.isSuitable,
              status: 'PENDING', // Initial status
              observations: inspectionData.observations || null,
              regionalId: regional.id,
              cityName: city.realName,
              // Resumen JSON con todas las respuestas y metadatos
              inspectionSummary: {
                totalQuestions: Object.keys(inspectionData.inspectionDetails || {}).length,
                answeredQuestions: Object.values(inspectionData.inspectionDetails || {}).filter(a => a).length,
                overallStatus: inspectionData.isSuitable ? 'apto' : 'no_apto',
                // Respuestas completas con metadatos desde Excel
                responses: inspectionData.inspectionDetails ? 
                  processInspectionAnswers(inspectionData.inspectionDetails, eppType) : []
              }
            }
          });

          // Las respuestas se almacenan en el campo JSON inspectionSummary
          // No creamos registros individuales en EppInspectionDetail para optimizar rendimiento
        });

        result.exitosos++;

      } catch (error) {
        console.error("Error procesando inspección:", error);
        result.errores.push({
          inspeccion: inspectionData,
          error: error instanceof Error ? error.message : "Error desconocido"
        });
        result.fallidos++;
      }
    }

    result.exitoso = result.fallidos === 0;
    return NextResponse.json(result);

  } catch (error) {
    console.error("[EPP_CERTIFICATIONS_MASS_CREATE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 