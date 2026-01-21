/**
 * Script para limpar todos os dados do banco de dados
 * 
 * ATENÇÃO: Este script deleta TODOS os dados de todas as tabelas!
 * Use apenas quando quiser começar do zero.
 * 
 * Execute com: npm run db:clear
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Limpando banco de dados...')

  try {
    // Ordem de deleção: tabelas filhas primeiro, depois tabelas pais
    // Isso evita erros de foreign key constraint

    console.log('  - Deletando AuditLogs...')
    await prisma.auditLog.deleteMany({})

    console.log('  - Deletando Results...')
    await prisma.result.deleteMany({})

    console.log('  - Deletando Objectives...')
    await prisma.objective.deleteMany({})

    console.log('  - Deletando PlannedHours...')
    await prisma.plannedHours.deleteMany({})

    console.log('  - Deletando Retainers...')
    await prisma.retainer.deleteMany({})

    console.log('  - Deletando RetainerCatalog...')
    await prisma.retainerCatalog.deleteMany({})

    console.log('  - Deletando FixedCosts...')
    await prisma.fixedCost.deleteMany({})

    console.log('  - Deletando Departments...')
    await prisma.department.deleteMany({})

    console.log('  - Deletando GlobalSettings...')
    await prisma.globalSetting.deleteMany({})

    console.log('  - Deletando Users...')
    await prisma.user.deleteMany({})

    console.log('✅ Banco de dados limpo com sucesso!')
    console.log('')
    console.log('💡 Próximos passos:')
    console.log('   1. Execute: npm run db:seed (para dados de exemplo)')
    console.log('   2. Ou insira seus dados reais manualmente')
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })

