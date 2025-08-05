const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Definir todas las preguntas por tipo de EPP según Microsoft Forms
const EPP_QUESTIONS_DATA = {
  "ARNES_CUERPO_COMPLETO": [
    { code: "quemaduras", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 1 },
    { code: "decoloracion", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 2 },
    { code: "manchas_quimicos", text: "¿Presenta manchas de químicos?", category: "Componente textil", displayOrder: 3 },
    { code: "costuras_sueltas", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 4 },
    { code: "desgaste_abrasion", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 5 },
    { code: "fibras_rotas", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 6 },
    { code: "cristalizacion", text: "¿Presenta cristalización?", category: "Componente textil", displayOrder: 7 },
    { code: "rigidez_correa", text: "¿Presenta rigidez en la correa o cuerda?", category: "Componente textil", displayOrder: 8 },
    { code: "presencia_moho", text: "¿Presenta presencia de moho?", category: "Componente textil", displayOrder: 9 },
    { code: "agujeros_perforaciones", text: "¿Presenta agujeros o perforaciones?", category: "Componente textil", displayOrder: 10 },
    { code: "corrosion", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 11 },
    { code: "deformacion", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 13 },
    { code: "conexion_adecuada_argollas", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Componente de funcionalidad", displayOrder: 14 },
    { code: "seguros_adecuados", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 15 }
  ],
  "ESLINGA_DOBLE_TERMINAL_EN_Y": [
    { code: "quemaduras2", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 1 },
    { code: "decoloracion2", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 2 },
    { code: "manchas_quimicos2", text: "¿Presenta manchas de químicos?", category: "Componente textil", displayOrder: 3 },
    { code: "costuras_sueltas2", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 4 },
    { code: "desgaste_abrasion2", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 5 },
    { code: "fibras_rotas2", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 6 },
    { code: "cristalizacion2", text: "¿Presenta cristalización?", category: "Componente textil", displayOrder: 7 },
    { code: "rigidez_correa2", text: "¿Presenta rigidez en la correa o cuerda?", category: "Componente textil", displayOrder: 8 },
    { code: "presencia_moho2", text: "¿Presenta presencia de moho?", category: "Componente textil", displayOrder: 9 },
    { code: "agujeros_perforaciones2", text: "¿Presenta agujeros o perforaciones?", category: "Componente textil", displayOrder: 10 },
    { code: "corrosion2", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 11 },
    { code: "deformacion2", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres2", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 13 },
    { code: "conexion_adecuada_argollas2", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Componente de funcionalidad", displayOrder: 14 },
    { code: "ganchos_cierre_automatico", text: "¿Los ganchos tienen cierre automático?", category: "Componente de funcionalidad", displayOrder: 15 },
    { code: "seguros_adecuados2", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 16 },
    { code: "indicador_impacto_activado", text: "¿El indicador de impacto está activado?", category: "Componente de impacto", displayOrder: 17 },
    { code: "absorbedor_activado", text: "¿El absorbedor está activado?", category: "Componente de impacto", displayOrder: 18 }
  ],
  "ESLINGA_POSICIONAMIENTO": [
    { code: "quemaduras3", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 1 },
    { code: "decoloracion3", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 2 },
    { code: "manchas_quimicos3", text: "¿Presenta manchas de químicos?", category: "Componente textil", displayOrder: 3 },
    { code: "costuras_sueltas3", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 4 },
    { code: "desgaste_abrasion3", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 5 },
    { code: "fibras_rotas3", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 6 },
    { code: "cristalizacion3", text: "¿Presenta cristalización?", category: "Componente textil", displayOrder: 7 },
    { code: "rigidez_correa3", text: "¿Presenta rigidez en la correa o cuerda?", category: "Componente textil", displayOrder: 8 },
    { code: "presencia_moho3", text: "¿Presenta presencia de moho?", category: "Componente textil", displayOrder: 9 },
    { code: "agujeros_perforaciones3", text: "¿Presenta agujeros o perforaciones?", category: "Componente textil", displayOrder: 10 },
    { code: "corrosion3", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 11 },
    { code: "deformacion3", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres3", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 13 },
    { code: "conexion_adecuada_argollas3", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Componente de funcionalidad", displayOrder: 14 },
    { code: "ganchos_cierre_automatico2", text: "¿Los ganchos tienen cierre automático?", category: "Componente de funcionalidad", displayOrder: 15 },
    { code: "seguros_adecuados3", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 16 }
  ],
  "FRENO_ARRESTADOR_CABLE": [
    { code: "corrosion4", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 1 },
    { code: "deformacion4", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 2 },
    { code: "argollas_quiebres_fracturas", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 3 },
    { code: "conexion_adecuada", text: "¿La conexión es adecuada?", category: "Componente de funcionalidad", displayOrder: 4 },
    { code: "seguros_adecuados4", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 5 }
  ],
  "MOSQUETON": [
    { code: "corrosion5", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 1 },
    { code: "deformacion5", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 2 },
    { code: "argollas_quiebres_fracturas2", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 3 },
    { code: "conexion_adecuada2", text: "¿La conexión es adecuada?", category: "Componente de funcionalidad", displayOrder: 4 },
    { code: "seguros_adecuados5", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 5 }
  ],
  "ANCLAJE_TIPO_TIE_OFF": [
    { code: "quemaduras4", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 1 },
    { code: "decoloracion4", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 2 },
    { code: "manchas_quimicos4", text: "¿Presenta manchas de químicos?", category: "Componente textil", displayOrder: 3 },
    { code: "costuras_sueltas4", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 4 },
    { code: "desgaste_abrasion4", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 5 },
    { code: "fibras_rotas4", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 6 },
    { code: "cristalizacion4", text: "¿Presenta cristalización?", category: "Componente textil", displayOrder: 7 },
    { code: "rigidez_correa4", text: "¿Presenta rigidez en la correa o cuerda?", category: "Componente textil", displayOrder: 8 },
    { code: "presencia_moho4", text: "¿Presenta presencia de moho?", category: "Componente textil", displayOrder: 9 },
    { code: "agujeros_perforaciones4", text: "¿Presenta agujeros o perforaciones?", category: "Componente textil", displayOrder: 10 },
    { code: "corrosion6", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 11 },
    { code: "deformacion6", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 12 },
    { code: "argollas_quiebres_fracturas_final", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 13 },
    { code: "conexion_adecuada_segura", text: "¿Conexion adecuada? (Permite conectarse de forma segura el equipo)", category: "Componente de funcionalidad", displayOrder: 14 }
  ],
};

const KIT_RESCATE_QUESTION_DATA = {
  // Nuevas preguntas para kit de rescate según requerimientos del usuario
  "ARNES_RESCATE": [
    { code: "quemaduras_arnes_rescate", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 1 },
    { code: "decoloracion_arnes_rescate", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 2 },
    { code: "manchas_quimicos_arnes_rescate", text: "¿Presenta manchas de químicos?", category: "Componente textil", displayOrder: 3 },
    { code: "costuras_sueltas_arnes_rescate", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 4 },
    { code: "desgaste_abrasion_arnes_rescate", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 5 },
    { code: "fibras_rotas_arnes_rescate", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 6 },
    { code: "cristalizacion_arnes_rescate", text: "¿Presenta cristalización?", category: "Componente textil", displayOrder: 7 },
    { code: "rigidez_correa_arnes_rescate", text: "¿Presenta rigidez en la correa o cuerda?", category: "Componente textil", displayOrder: 8 },
    { code: "presencia_moho_arnes_rescate", text: "¿Presenta presencia de moho?", category: "Componente textil", displayOrder: 9 },
    { code: "agujeros_perforaciones_arnes_rescate", text: "¿Presenta agujeros o perforaciones?", category: "Componente textil", displayOrder: 10 },
    { code: "corrosion_arnes_rescate", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 11 },
    { code: "deformacion_arnes_rescate", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 12 },
    { code: "argollas_hebillas_quiebres_arnes_rescate", text: "¿Las argollas o hebillas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 13 },
    { code: "conexion_adecuada_argollas_arnes_rescate", text: "¿La conexión es adecuada (Argollas y hebillas)?", category: "Componente de funcionalidad", displayOrder: 14 },
    { code: "seguros_adecuados_arnes_rescate", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 15 }
  ],
  "POLIPASTO_RESCATE": [
    // Criterios de mosquetón (componente metálico)
    { code: "corrosion_polipasto_rescate", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 1 },
    { code: "deformacion_polipasto_rescate", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 2 },
    { code: "argollas_quiebres_polipasto_rescate", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 3 },
    { code: "conexion_adecuada_polipasto_rescate", text: "¿La conexión es adecuada?", category: "Componente de funcionalidad", displayOrder: 4 },
    { code: "seguros_adecuados_polipasto_rescate", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 5 },
    // Criterios de arnés (componente textil)
    { code: "quemaduras_polipasto_rescate", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 6 },
    { code: "decoloracion_polipasto_rescate", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 7 },
    { code: "costuras_sueltas_polipasto_rescate", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 8 },
    { code: "desgaste_abrasion_polipasto_rescate", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 9 },
    { code: "fibras_rotas_polipasto_rescate", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 10 },
    // Pregunta funcional específica para polipasto
    { code: "maniobras_descenso_ascenso_polipasto_rescate", text: "¿El polipasto permite realizar maniobras de descenso o ascenso?", category: "Componente de funcionalidad", displayOrder: 11 }
  ],
  "MOSQUETON_RESCATE": [
    { code: "corrosion_mosqueton_rescate", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 1 },
    { code: "deformacion_mosqueton_rescate", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 2 },
    { code: "argollas_quiebres_mosqueton_rescate", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 3 },
    { code: "conexion_adecuada_mosqueton_rescate", text: "¿La conexión es adecuada?", category: "Componente de funcionalidad", displayOrder: 4 },
    { code: "seguros_adecuados_mosqueton_rescate", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 5 }
  ],
  "ANCLAJE_PORTATIL_RESCATE": [
    { code: "quemaduras_anclaje_portatil_rescate", text: "¿Presenta quemaduras?", category: "Componente textil", displayOrder: 1 },
    { code: "decoloracion_anclaje_portatil_rescate", text: "¿Presenta decoloración?", category: "Componente textil", displayOrder: 2 },
    { code: "manchas_quimicos_anclaje_portatil_rescate", text: "¿Presenta manchas de químicos?", category: "Componente textil", displayOrder: 3 },
    { code: "costuras_sueltas_anclaje_portatil_rescate", text: "¿Presenta costuras sueltas?", category: "Componente textil", displayOrder: 4 },
    { code: "desgaste_abrasion_anclaje_portatil_rescate", text: "¿Presenta desgaste por abrasión?", category: "Componente textil", displayOrder: 5 },
    { code: "fibras_rotas_anclaje_portatil_rescate", text: "¿Presenta fibras rotas?", category: "Componente textil", displayOrder: 6 },
    { code: "cristalizacion_anclaje_portatil_rescate", text: "¿Presenta cristalización?", category: "Componente textil", displayOrder: 7 },
    { code: "rigidez_correa_anclaje_portatil_rescate", text: "¿Presenta rigidez en la correa o cuerda?", category: "Componente textil", displayOrder: 8 },
    { code: "presencia_moho_anclaje_portatil_rescate", text: "¿Presenta presencia de moho?", category: "Componente textil", displayOrder: 9 },
    { code: "agujeros_perforaciones_anclaje_portatil_rescate", text: "¿Presenta agujeros o perforaciones?", category: "Componente textil", displayOrder: 10 },
    { code: "corrosion_anclaje_portatil_rescate", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 11 },
    { code: "deformacion_anclaje_portatil_rescate", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 12 },
    { code: "argollas_quiebres_fracturas_anclaje_portatil_rescate", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 13 },
    { code: "conexion_adecuada_segura_anclaje_portatil_rescate", text: "¿Conexion adecuada? (Permite conectarse de forma segura el equipo)", category: "Componente de funcionalidad", displayOrder: 14 }
  ],
  "BLOQUEADORES_RESCATE": [
    // Criterios basados en arrestador con sufijo RESCATE
    { code: "corrosion_bloqueadores_rescate", text: "¿Presenta corrosión?", category: "Componente metálico", displayOrder: 1 },
    { code: "deformacion_bloqueadores_rescate", text: "¿Presenta deformación?", category: "Componente metálico", displayOrder: 2 },
    { code: "argollas_quiebres_bloqueadores_rescate", text: "¿Las argollas presentan quiebres o fracturas?", category: "Componente metálico", displayOrder: 3 },
    { code: "conexion_adecuada_bloqueadores_rescate", text: "¿La conexión es adecuada?", category: "Componente de funcionalidad", displayOrder: 4 },
    { code: "seguros_adecuados_bloqueadores_rescate", text: "¿Los seguros son adecuados?", category: "Componente de funcionalidad", displayOrder: 5 }
  ]
};

// Función para insertar preguntas EPP normales
async function seedEppQuestions() {
  console.log('🌱 Iniciando seed de preguntas EPP normales...');

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

    console.log('🎉 Seed de preguntas EPP normales completado exitosamente');

  } catch (error) {
    console.error('❌ Error en seed de preguntas EPP normales:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para insertar preguntas de kit de rescate
async function seedKitRescateQuestions() {
  console.log('🌱 Iniciando seed de preguntas de Kit de Rescate...');

  try {
    // Limpiar preguntas existentes
    await prisma.eppInspectionQuestion.deleteMany();
    console.log('✅ Preguntas EPP existentes eliminadas');

    // Insertar nuevas preguntas
    for (const [eppType, questions] of Object.entries(KIT_RESCATE_QUESTION_DATA)) {
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

    console.log('🎉 Seed de preguntas de Kit de Rescate completado exitosamente');

  } catch (error) {
    console.error('❌ Error en seed de preguntas de Kit de Rescate:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para insertar todas las preguntas (normales + kit de rescate)
async function seedAllQuestions() {
  console.log('🌱 Iniciando seed de TODAS las preguntas EPP...');

  try {
    // Limpiar preguntas existentes
    await prisma.eppInspectionQuestion.deleteMany();
    console.log('✅ Preguntas EPP existentes eliminadas');

    // Combinar ambos conjuntos de datos
    const allQuestions = { ...EPP_QUESTIONS_DATA, ...KIT_RESCATE_QUESTION_DATA };

    // Insertar nuevas preguntas
    for (const [eppType, questions] of Object.entries(allQuestions)) {
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

    console.log('🎉 Seed de TODAS las preguntas EPP completado exitosamente');

  } catch (error) {
    console.error('❌ Error en seed de todas las preguntas EPP:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función principal que maneja los argumentos de línea de comandos
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🚀 Iniciando script de seed de preguntas EPP...');
  console.log('Comandos disponibles:');
  console.log('  normal     - Insertar solo preguntas EPP normales');
  console.log('  rescate    - Insertar solo preguntas de Kit de Rescate');
  console.log('  all        - Insertar todas las preguntas (normales + rescate)');
  console.log('  help       - Mostrar esta ayuda');

  switch (command) {
    case 'normal':
      await seedEppQuestions();
      break;
    case 'rescate':
      await seedKitRescateQuestions();
      break;
    case 'all':
      await seedAllQuestions();
      break;
    case 'help':
    default:
      console.log('\n📋 Uso:');
      console.log('  npx ts-node scripts/seed-epp-questions.ts normal');
      console.log('  npx ts-node scripts/seed-epp-questions.ts rescate');
      console.log('  npx ts-node scripts/seed-epp-questions.ts all');
      console.log('  npx ts-node scripts/seed-epp-questions.ts help');
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { seedEppQuestions, seedKitRescateQuestions, seedAllQuestions }; 