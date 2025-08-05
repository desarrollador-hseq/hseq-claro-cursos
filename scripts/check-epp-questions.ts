import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEppQuestions() {
  console.log('🔍 Verificando preguntas EPP en la base de datos...');

  try {
    // Obtener todas las preguntas agrupadas por tipo
    const questions = await prisma.eppInspectionQuestion.findMany({
      orderBy: [
        { eppType: 'asc' },
        { displayOrder: 'asc' }
      ]
    });

    // Agrupar por tipo de EPP
    const groupedQuestions = questions.reduce((acc, question) => {
      if (!acc[question.eppType]) {
        acc[question.eppType] = [];
      }
      acc[question.eppType].push(question);
      return acc;
    }, {} as Record<string, any[]>);

    console.log('\n📊 Preguntas por tipo de EPP:');
    console.log('================================');

    for (const [eppType, typeQuestions] of Object.entries(groupedQuestions)) {
      console.log(`\n${eppType}:`);
      console.log(`  Total preguntas: ${typeQuestions.length}`);
      
      // Mostrar las primeras 3 preguntas como ejemplo
      typeQuestions.slice(0, 3).forEach((q, index) => {
        console.log(`  ${index + 1}. ${q.questionText} (${q.questionCode})`);
      });
      
      if (typeQuestions.length > 3) {
        console.log(`  ... y ${typeQuestions.length - 3} preguntas más`);
      }
    }

    // Verificar específicamente los tipos de kit de rescate
    const kitRescateTypes = [
      'ARNES_RESCATE',
      'POLIPASTO_RESCATE', 
      'MOSQUETON_RESCATE',
      'ANCLAJE_PORTATIL_RESCATE',
      'BLOQUEADORES_RESCATE'
    ];

    console.log('\n🔍 Verificando tipos de Kit de Rescate:');
    console.log('========================================');

    for (const eppType of kitRescateTypes) {
      const count = await prisma.eppInspectionQuestion.count({
        where: { eppType: eppType as any }
      });
      
      const status = count > 0 ? '✅' : '❌';
      console.log(`${status} ${eppType}: ${count} preguntas`);
    }

  } catch (error) {
    console.error('❌ Error verificando preguntas EPP:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkEppQuestions();
} 