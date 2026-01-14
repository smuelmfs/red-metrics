import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ExtractedData {
  departments: Array<{
    name: string
    billableHeadcount: number
    costPerPersonPerMonth: number | null
    targetUtilization: number
    averageHourlyRate: number
  }>
  retainerCatalog: Array<{
    name: string
    departmentName: string
    monthlyPrice: number | null
    hoursPerMonth: number | null
    baseHours: number | null
    basePrice: number | null
  }>
  retainers: Array<{
    name: string
    catalogName: string
    departmentName: string
    monthlyPrice: number | null
    quantity: number
    notes: string | null
  }>
}

async function main() {
  console.log('🌱 Seeding database with real data from Excel...')

  // Ler dados extraídos
  const dataPath = path.join(__dirname, '..', 'extracted-data.json')
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Arquivo extracted-data.json não encontrado!')
    console.log('Execute primeiro: node scripts/extract-real-data.js')
    process.exit(1)
  }

  const extractedData: ExtractedData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))

  // 1. Criar usuário admin padrão
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@redagency.com' },
    update: {},
    create: {
      email: 'admin@redagency.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created:', admin.email)

  // 2. Criar configurações globais
  const settings = [
    {
      key: 'targetMargin',
      value: '0.3',
      description: 'Margem alvo (ex.: 0,30 = 30%)'
    },
    {
      key: 'hoursPerMonth',
      value: '160',
      description: 'Horas de trabalho por mês'
    },
    {
      key: 'targetUtilization',
      value: '0.65',
      description: 'Utilização faturável média (ex.: 0,65 = 65%)'
    },
    {
      key: 'costPerPersonPerMonth',
      value: '2200',
      description: 'Custo médio por pessoa / mês (empresa)'
    },
    {
      key: 'overheadPeople',
      value: '6',
      description: 'Nº pessoas NÃO faturáveis (overhead)'
    }
  ]

  for (const setting of settings) {
    await prisma.globalSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting
    })
  }

  console.log('✅ Global settings created')

  // 3. Criar Departamentos
  console.log('\n📋 Criando Departamentos...')
  const departmentMap = new Map<string, string>()

  for (const dept of extractedData.departments) {
    // Ignorar departamentos não faturáveis
    if (dept.name.includes('não faturável') || dept.averageHourlyRate === 0) {
      console.log(`   ⏭️  Pulando: ${dept.name} (não faturável)`)
      continue
    }

    const created = await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        billableHeadcount: dept.billableHeadcount,
        costPerPersonPerMonth: dept.costPerPersonPerMonth ? dept.costPerPersonPerMonth : undefined,
        targetUtilization: dept.targetUtilization,
        averageHourlyRate: dept.averageHourlyRate
      },
      create: {
        name: dept.name,
        billableHeadcount: dept.billableHeadcount,
        costPerPersonPerMonth: dept.costPerPersonPerMonth || undefined,
        targetUtilization: dept.targetUtilization,
        averageHourlyRate: dept.averageHourlyRate
      }
    })

    departmentMap.set(dept.name, created.id)
    console.log(`   ✅ ${dept.name} (HC: ${dept.billableHeadcount}, Taxa: €${dept.averageHourlyRate}/h)`)
  }

  // 4. Criar Catálogo de Avenças
  console.log('\n📋 Criando Catálogo de Avenças...')
  const catalogMap = new Map<string, string>()

  for (const catalog of extractedData.retainerCatalog) {
    const departmentId = departmentMap.get(catalog.departmentName)
    
    if (!departmentId) {
      console.log(`   ⚠️  Departamento não encontrado: ${catalog.departmentName}`)
      continue
    }

    // Usar preço base se mensal não estiver disponível
    const finalPrice = catalog.monthlyPrice || catalog.basePrice || 0
    const finalHours = catalog.hoursPerMonth || catalog.baseHours || 0

    if (finalPrice === 0 && finalHours === 0) {
      console.log(`   ⏭️  Pulando: ${catalog.name} (sem preço/horas)`)
      continue
    }

    const created = await prisma.retainerCatalog.upsert({
      where: { name: catalog.name },
      update: {
        departmentId,
        monthlyPrice: finalPrice,
        hoursPerMonth: finalHours,
        baseHours: catalog.baseHours || finalHours,
        basePrice: catalog.basePrice || finalPrice
      },
      create: {
        name: catalog.name,
        departmentId,
        monthlyPrice: finalPrice,
        hoursPerMonth: finalHours,
        baseHours: catalog.baseHours || finalHours,
        basePrice: catalog.basePrice || finalPrice,
        isActive: true
      }
    })

    catalogMap.set(catalog.name, created.id)
    console.log(`   ✅ ${catalog.name} (€${finalPrice}/mês, ${finalHours}h)`)
  }

  // 5. Criar Avenças Ativas (se houver)
  if (extractedData.retainers.length > 0) {
    console.log('\n📋 Criando Avenças Ativas...')
    const currentDate = new Date()
    
    for (const retainer of extractedData.retainers) {
      const departmentId = departmentMap.get(retainer.departmentName)
      const catalogId = catalogMap.get(retainer.catalogName)
      
      if (!departmentId) {
        console.log(`   ⚠️  Departamento não encontrado: ${retainer.departmentName}`)
        continue
      }

      // Buscar preço do catálogo se não tiver
      let monthlyPrice = retainer.monthlyPrice
      if (!monthlyPrice && catalogId) {
        const catalog = await prisma.retainerCatalog.findUnique({
          where: { id: catalogId }
        })
        monthlyPrice = catalog ? Number(catalog.monthlyPrice) : null
      }

      if (!monthlyPrice) {
        console.log(`   ⏭️  Pulando: ${retainer.name} (sem preço)`)
        continue
      }

      // Verificar se já existe
      const existing = await prisma.retainer.findFirst({
        where: {
          departmentId,
          name: retainer.name
        }
      })

      if (existing) {
        const monthlyRevenue = monthlyPrice * retainer.quantity
        
        await prisma.retainer.update({
          where: { id: existing.id },
          data: {
            catalogId: catalogId || undefined,
            monthlyPrice,
            quantity: retainer.quantity,
            monthlyRevenue,
            notes: retainer.notes || undefined,
            isActive: retainer.quantity > 0
          }
        })
      } else {
        const monthlyRevenue = monthlyPrice * retainer.quantity
        
        await prisma.retainer.create({
          data: {
            departmentId,
            catalogId: catalogId || undefined,
            name: retainer.name,
            monthlyPrice,
            quantity: retainer.quantity,
            monthlyRevenue,
            notes: retainer.notes || undefined,
            startDate: currentDate,
            isActive: retainer.quantity > 0
          }
        })
      }

      console.log(`   ✅ ${retainer.name} (${retainer.quantity}x €${monthlyPrice}/mês)`)
    }
  } else {
    console.log('\n📋 Nenhuma avença ativa encontrada na planilha (todas com quantidade 0)')
  }

  console.log('\n🎉 Seeding completed!')
  console.log(`\n📊 Resumo:`)
  console.log(`   - Departamentos: ${departmentMap.size}`)
  console.log(`   - Catálogo Avenças: ${catalogMap.size}`)
  console.log(`   - Avenças Ativas: ${extractedData.retainers.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

