/**
 * Script de teste para sincronizar horas do Odoo
 * 
 * Execute com: tsx prisma/test-odoo-sync.ts
 */

import { PrismaClient } from '@prisma/client'
import { getOdooConfig } from '../src/lib/integrations/odoo/service'
import { OdooClient } from '../src/lib/integrations/odoo/client'
import { syncOdooHours } from '../src/lib/integrations/odoo/service'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Testando sincronização com Odoo...\n')

  try {
    // Verificar se há configuração do Odoo
    const config = await getOdooConfig()
    if (!config) {
      console.error('❌ Configuração do Odoo não encontrada!')
      console.log('💡 Configure a integração Odoo primeiro em /dashboard/odoo')
      return
    }

    console.log('✅ Configuração do Odoo encontrada')
    console.log(`   URL: ${config.baseUrl}`)
    console.log(`   Database: ${config.database}\n`)

    // Testar conexão
    console.log('🔌 Testando conexão com Odoo...')
    const client = new OdooClient(config)
    const testResult = await client.testConnection()
    
    if (!testResult.success) {
      console.error(`❌ Erro na conexão: ${testResult.message}`)
      return
    }

    console.log(`✅ ${testResult.message}\n`)

    // Buscar departamentos
    console.log('📋 Buscando departamentos do Odoo...')
    const departments = await client.getDepartments()
    console.log(`✅ ${departments.length} departamentos encontrados:`)
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (ID: ${dept.id})`)
    })
    console.log('')

    // Buscar horas do mês atual (ou janeiro 2026 se ainda não estamos em 2026)
    const now = new Date()
    const month = now.getMonth() + 1
    const year = Math.max(2026, now.getFullYear())

    console.log(`📊 Buscando horas para ${month}/${year}...`)
    const hoursData = await client.getAllDepartmentsHours(month, year)
    
    console.log(`✅ ${hoursData.length} departamentos com horas encontrados:`)
    hoursData.forEach(hours => {
      console.log(`   - ${hours.departmentName}: ${hours.totalHours.toFixed(2)} horas`)
    })
    console.log('')

    // Sincronizar
    console.log(`🔄 Sincronizando horas do Odoo para ${month}/${year}...`)
    const syncResult = await syncOdooHours(month, year)

    if (syncResult.success) {
      console.log(`✅ Sincronização concluída com sucesso!`)
      console.log(`   ${syncResult.syncedCount} departamento(s) atualizado(s)`)
    } else {
      console.error(`❌ Sincronização com erros:`)
      syncResult.errors.forEach(error => {
        console.error(`   - ${error}`)
      })
    }

    // Verificar departamentos criados
    console.log('\n📋 Verificando departamentos criados no sistema...')
    const createdDepartments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    })
    console.log(`✅ ${createdDepartments.length} departamento(s) no sistema:`)
    createdDepartments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code || 'sem código'})`)
    })

    // Verificar horas sincronizadas
    console.log('\n📊 Verificando horas sincronizadas...')
    const syncedHours = await prisma.plannedHours.findMany({
      where: {
        month,
        year,
        syncedFromOdoo: true
      },
      include: {
        department: true
      },
      orderBy: {
        department: {
          name: 'asc'
        }
      }
    })
    console.log(`✅ ${syncedHours.length} registro(s) de horas sincronizado(s):`)
    syncedHours.forEach(ph => {
      console.log(`   - ${ph.department.name}: ${ph.actualBillableHours?.toFixed(2) || '0'} horas`)
    })

    console.log('\n✅ Teste concluído!')
  } catch (error: any) {
    console.error('❌ Erro durante o teste:', error.message)
    console.error(error)
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

