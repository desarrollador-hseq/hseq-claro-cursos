import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Definir todas las preguntas por tipo de EPP según Microsoft Forms
const EPP_QUESTIONS_DATA = {
  "ARNES_CUERPO_COMPLETO": [
    { code: "quemaduras", text: "¿Presenta quemaduras?", category: "Inspección Visual", displayOrder: 1 },
    { code: "decoloracion", text: "¿Presenta decoloración?", category: "Inspección Visual", displayOrder: 2 },
    { code: "manchas_quimicos", text: "¿Presenta manchas de químicos?", category: "Inspección Visual", displayOrder: 3 },
    { code: "costuras_sueltas", text: "¿Presenta costuras sueltas?", category: "Inspección Estructural", displayOrder: 4 },
    { code: "desgaste_abrasion", text: "¿Presenta desgaste por abrasión?", category: "Inspección Estructural", displayOrder: 5 },
    { code: "fibras_rotas", text: "¿Presenta fibras rotas?", category: "Inspección Estructural", displayOrder: 6 },
    { code: "cristalizacion", text: "¿Presenta cristalización?", category: "Inspección Material", displayOrder: 7 },
    { code: "rigidez_correa", text: "¿Presenta rigidez en la correa o cuerda?", category: "Inspección Flexibilidad", displayOrder: 8 },
    { code: "presencia_moho", text: "¿Presenta presencia de moho?", category: "Inspección Contaminación", displayOrder: 9 },
    { code: "agujeros_perforaciones", text: "¿Presenta agujeros o perforaciones?", category: "Inspección Estructural", displayOrder: 10 },
    { code: "corrosion", text: "¿Presenta corrosión?", category: "Inspección Corrosión", displayOrder: 11 },
    { code: "deformacion", text: "¿Presenta deformación?", category: "Inspección Estructural", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Inspección Hardware", displayOrder: 13 },
    { code: "conexion_adecuada_argollas", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Inspección Conexión", displayOrder: 14 },
    { code: "seguros_adecuados", text: "¿Los seguros son adecuados?", category: "Inspección Seguridad", displayOrder: 15 }
  ],
  "ESLINGA_DOBLE_TERMINAL_EN_Y": [
    { code: "quemaduras2", text: "¿Presenta quemaduras?", category: "Inspección Visual", displayOrder: 1 },
    { code: "decoloracion2", text: "¿Presenta decoloración?", category: "Inspección Visual", displayOrder: 2 },
    { code: "manchas_quimicos2", text: "¿Presenta manchas de químicos?", category: "Inspección Visual", displayOrder: 3 },
    { code: "costuras_sueltas2", text: "¿Presenta costuras sueltas?", category: "Inspección Estructural", displayOrder: 4 },
    { code: "desgaste_abrasion2", text: "¿Presenta desgaste por abrasión?", category: "Inspección Estructural", displayOrder: 5 },
    { code: "fibras_rotas2", text: "¿Presenta fibras rotas?", category: "Inspección Estructural", displayOrder: 6 },
    { code: "cristalizacion2", text: "¿Presenta cristalización?", category: "Inspección Material", displayOrder: 7 },
    { code: "rigidez_correa2", text: "¿Presenta rigidez en la correa o cuerda?", category: "Inspección Flexibilidad", displayOrder: 8 },
    { code: "presencia_moho2", text: "¿Presenta presencia de moho?", category: "Inspección Contaminación", displayOrder: 9 },
    { code: "agujeros_perforaciones2", text: "¿Presenta agujeros o perforaciones?", category: "Inspección Estructural", displayOrder: 10 },
    { code: "corrosion2", text: "¿Presenta corrosión?", category: "Inspección Corrosión", displayOrder: 11 },
    { code: "deformacion2", text: "¿Presenta deformación?", category: "Inspección Estructural", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres2", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Inspección Hardware", displayOrder: 13 },
    { code: "conexion_adecuada_argollas2", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Inspección Conexión", displayOrder: 14 },
    { code: "ganchos_cierre_automatico", text: "¿Los ganchos tienen cierre automático?", category: "Inspección Hardware", displayOrder: 15 },
    { code: "seguros_adecuados2", text: "¿Los seguros son adecuados?", category: "Inspección Seguridad", displayOrder: 16 },
    { code: "indicador_impacto_activado", text: "¿El indicador de impacto está activado?", category: "Inspección Seguridad", displayOrder: 17 },
    { code: "absorbedor_activado", text: "¿El absorbedor está activado?", category: "Inspección Seguridad", displayOrder: 18 }
  ],
  "ESLINGA_POSICIONAMIENTO": [
    { code: "quemaduras3", text: "¿Presenta quemaduras?", category: "Inspección Visual", displayOrder: 1 },
    { code: "decoloracion3", text: "¿Presenta decoloración?", category: "Inspección Visual", displayOrder: 2 },
    { code: "manchas_quimicos3", text: "¿Presenta manchas de químicos?", category: "Inspección Visual", displayOrder: 3 },
    { code: "costuras_sueltas3", text: "¿Presenta costuras sueltas?", category: "Inspección Estructural", displayOrder: 4 },
    { code: "desgaste_abrasion3", text: "¿Presenta desgaste por abrasión?", category: "Inspección Estructural", displayOrder: 5 },
    { code: "fibras_rotas3", text: "¿Presenta fibras rotas?", category: "Inspección Estructural", displayOrder: 6 },
    { code: "cristalizacion3", text: "¿Presenta cristalización?", category: "Inspección Material", displayOrder: 7 },
    { code: "rigidez_correa3", text: "¿Presenta rigidez en la correa o cuerda?", category: "Inspección Flexibilidad", displayOrder: 8 },
    { code: "presencia_moho3", text: "¿Presenta presencia de moho?", category: "Inspección Contaminación", displayOrder: 9 },
    { code: "agujeros_perforaciones3", text: "¿Presenta agujeros o perforaciones?", category: "Inspección Estructural", displayOrder: 10 },
    { code: "corrosion3", text: "¿Presenta corrosión?", category: "Inspección Corrosión", displayOrder: 11 },
    { code: "deformacion3", text: "¿Presenta deformación?", category: "Inspección Estructural", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres3", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Inspección Hardware", displayOrder: 13 },
    { code: "conexion_adecuada_argollas3", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Inspección Conexión", displayOrder: 14 },
    { code: "ganchos_cierre_automatico2", text: "¿Los ganchos tienen cierre automático?", category: "Inspección Hardware", displayOrder: 15 },
    { code: "seguros_adecuados3", text: "¿Los seguros son adecuados?", category: "Inspección Seguridad", displayOrder: 16 }
  ],
  "FRENO_ARRESTADOR_CABLE": [
    { code: "corrosion4", text: "¿Presenta corrosión?", category: "Inspección Corrosión", displayOrder: 1 },
    { code: "deformacion4", text: "¿Presenta deformación?", category: "Inspección Estructural", displayOrder: 2 },
    { code: "argollas_quiebres_fracturas", text: "¿Las argollas presentan quiebres o fracturas?", category: "Inspección Hardware", displayOrder: 3 },
    { code: "conexion_adecuada", text: "¿La conexión es adecuada?", category: "Inspección Conexión", displayOrder: 4 },
    { code: "seguros_adecuados4", text: "¿Los seguros son adecuados?", category: "Inspección Seguridad", displayOrder: 5 }
  ],
  "MOSQUETON": [
    { code: "corrosion5", text: "¿Presenta corrosión?", category: "Inspección Corrosión", displayOrder: 1 },
    { code: "deformacion5", text: "¿Presenta deformación?", category: "Inspección Estructural", displayOrder: 2 },
    { code: "argollas_quiebres_fracturas2", text: "¿Las argollas presentan quiebres o fracturas?", category: "Inspección Hardware", displayOrder: 3 },
    { code: "conexion_adecuada2", text: "¿La conexión es adecuada?", category: "Inspección Conexión", displayOrder: 4 },
    { code: "seguros_adecuados5", text: "¿Los seguros son adecuados?", category: "Inspección Seguridad", displayOrder: 5 }
  ],
  "ANCLAJE_TIPO_TIE_OFF": [
    { code: "quemaduras4", text: "¿Presenta quemaduras?", category: "Inspección Visual", displayOrder: 1 },
    { code: "decoloracion4", text: "¿Presenta decoloración?", category: "Inspección Visual", displayOrder: 2 },
    { code: "manchas_quimicos4", text: "¿Presenta manchas de químicos?", category: "Inspección Visual", displayOrder: 3 },
    { code: "costuras_sueltas4", text: "¿Presenta costuras sueltas?", category: "Inspección Estructural", displayOrder: 4 },
    { code: "desgaste_abrasion4", text: "¿Presenta desgaste por abrasión?", category: "Inspección Estructural", displayOrder: 5 },
    { code: "fibras_rotas4", text: "¿Presenta fibras rotas?", category: "Inspección Estructural", displayOrder: 6 },
    { code: "cristalizacion4", text: "¿Presenta cristalización?", category: "Inspección Material", displayOrder: 7 },
    { code: "rigidez_correa4", text: "¿Presenta rigidez en la correa o cuerda?", category: "Inspección Flexibilidad", displayOrder: 8 },
    { code: "presencia_moho4", text: "¿Presenta presencia de moho?", category: "Inspección Contaminación", displayOrder: 9 },
    { code: "agujeros_perforaciones4", text: "¿Presenta agujeros o perforaciones?", category: "Inspección Estructural", displayOrder: 10 },
    { code: "corrosion6", text: "¿Presenta corrosión?", category: "Inspección Corrosión", displayOrder: 11 },
    { code: "deformacion6", text: "¿Presenta deformación?", category: "Inspección Estructural", displayOrder: 12 },
    { code: "argollas_quiebres_fracturas_final", text: "¿Las argollas presentan quiebres o fracturas?", category: "Inspección Hardware", displayOrder: 13 },
    { code: "conexion_adecuada_segura", text: "¿Permite conectarse de forma segura el equipo?", category: "Inspección Conexión", displayOrder: 14 }
  ]
};

async function seedEppQuestions() {
  console.log('🌱 Iniciando seed de preguntas EPP...');

  try {
    // Limpiar preguntas existentes
    await prisma.eppInspectionQuestion.deleteMany();
    console.log('✅ Preguntas EPP existentes eliminadas');

    // Insertar nuevas preguntas
    for (const [eppType, questions] of Object.entries(EPP_QUESTIONS_DATA)) {
      console.log(`📝 Insertando preguntas para ${eppType}...`);
      
      for (const question of questions) {
        await prisma.eppInspectionQuestion.create({
          data: {
            eppType: eppType as any, // Cast to EppType enum
            questionCode: question.code,
            questionText: question.text,
            category: question.category,
            displayOrder: question.displayOrder,
            isRequired: true,
            answerType: 'YES_NO',
            affectsSuitability: false, // El estado es manual
            active: true
          }
        });
      }
      
      console.log(`✅ ${questions.length} preguntas insertadas para ${eppType}`);
    }

    console.log('🎉 Seed de preguntas EPP completado exitosamente');

  } catch (error) {
    console.error('❌ Error en seed de preguntas EPP:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedEppQuestions();
}

export { seedEppQuestions }; 