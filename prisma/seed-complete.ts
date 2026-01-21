import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with complete fictional data...')

  // 0. Limpar dados de domínio (preservando usuários / auth)
  console.log('🧹 Limpando dados de domínio (preservando usuários)...')

  await prisma.auditLog.deleteMany({})
  await prisma.result.deleteMany({})
  await prisma.objective.deleteMany({})
  await prisma.plannedHours.deleteMany({})
  await prisma.retainer.deleteMany({})
  await prisma.retainerCatalog.deleteMany({})
  await prisma.fixedCost.deleteMany({})
  await prisma.department.deleteMany({})
  await prisma.globalSetting.deleteMany({})

  console.log('✅ Dados de domínio limpos (usuários preservados)')

  // 1. Criar configurações globais
  const settings = [
    {
      key: 'targetMargin',
      value: '0.30',
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

  // 2. Criar Departamentos
  const departmentsData = [
    {
      name: 'Branding & Design',
      code: 'DESIGN',
      billableHeadcount: 4,
      averageHourlyRate: 45,
      targetUtilization: 0.65,
      costPerPersonPerMonth: 2200
    },
    {
      name: 'Marketing Digital & Performance',
      code: 'MARKETING',
      billableHeadcount: 3,
      averageHourlyRate: 50,
      targetUtilization: 0.70,
      costPerPersonPerMonth: 2200
    },
    {
      name: 'Vídeo & Fotografia',
      code: 'VIDEO',
      billableHeadcount: 2,
      averageHourlyRate: 55,
      targetUtilization: 0.60,
      costPerPersonPerMonth: 2500
    },
    {
      name: 'Web / UX / Dev',
      code: 'WEB',
      billableHeadcount: 4,
      averageHourlyRate: 55,
      targetUtilization: 0.65,
      costPerPersonPerMonth: 2400
    }
  ]

  const departmentMap = new Map<string, string>()

  for (const deptData of departmentsData) {
    const dept = await prisma.department.upsert({
      where: { name: deptData.name },
      update: {
        billableHeadcount: deptData.billableHeadcount,
        averageHourlyRate: deptData.averageHourlyRate,
        targetUtilization: deptData.targetUtilization,
        costPerPersonPerMonth: deptData.costPerPersonPerMonth
      },
      create: {
        name: deptData.name,
        code: deptData.code,
        billableHeadcount: deptData.billableHeadcount,
        averageHourlyRate: deptData.averageHourlyRate,
        targetUtilization: deptData.targetUtilization,
        costPerPersonPerMonth: deptData.costPerPersonPerMonth,
        isActive: true
      }
    })
    departmentMap.set(deptData.name, dept.id)
    console.log(`✅ Department: ${dept.name}`)
  }

  // 3. Calcular métricas anuais dos departamentos
  const { calculateDepartmentAnnualMetrics } = await import('../src/lib/business-logic/calculations')
  for (const deptId of departmentMap.values()) {
    await calculateDepartmentAnnualMetrics(deptId)
  }
  console.log('✅ Department annual metrics calculated')

  // 4. Criar Catálogo de Avenças
  const catalogData = [
    {
      name: 'Gestão Redes Sociais - Básico',
      departmentName: 'Marketing Digital & Performance',
      monthlyPrice: 800,
      hoursPerMonth: 20,
      internalHourlyCost: 30,
      baseHours: 20,
      basePrice: 800
    },
    {
      name: 'Gestão Redes Sociais - Premium',
      departmentName: 'Marketing Digital & Performance',
      monthlyPrice: 1500,
      hoursPerMonth: 40,
      internalHourlyCost: 30,
      baseHours: 40,
      basePrice: 1500
    },
    {
      name: 'Identidade Visual Completa',
      departmentName: 'Branding & Design',
      monthlyPrice: 2000,
      hoursPerMonth: 30,
      internalHourlyCost: 35,
      baseHours: 30,
      basePrice: 2000
    },
    {
      name: 'Website WordPress',
      departmentName: 'Web / UX / Dev',
      monthlyPrice: 1200,
      hoursPerMonth: 25,
      internalHourlyCost: 40,
      baseHours: 25,
      basePrice: 1200
    },
    {
      name: 'Vídeo Institucional',
      departmentName: 'Vídeo & Fotografia',
      monthlyPrice: 2500,
      hoursPerMonth: 35,
      internalHourlyCost: 45,
      baseHours: 35,
      basePrice: 2500
    }
  ]

  const catalogMap = new Map<string, string>()

  for (const catalogItem of catalogData) {
    const departmentId = departmentMap.get(catalogItem.departmentName)
    if (!departmentId) continue

    // Calcular custo mensal e margem (mesma lógica da API)
    const monthlyCost = catalogItem.internalHourlyCost * catalogItem.hoursPerMonth
    const monthlyMargin = catalogItem.monthlyPrice - monthlyCost
    const marginPercentage = catalogItem.monthlyPrice > 0
      ? (monthlyMargin / catalogItem.monthlyPrice) * 100
      : 0

    const catalog = await prisma.retainerCatalog.upsert({
      where: { name: catalogItem.name },
      update: {
        departmentId,
        monthlyPrice: catalogItem.monthlyPrice,
        hoursPerMonth: catalogItem.hoursPerMonth,
        internalHourlyCost: catalogItem.internalHourlyCost,
        monthlyCost,
        monthlyMargin,
        marginPercentage,
        baseHours: catalogItem.baseHours,
        basePrice: catalogItem.basePrice
      },
      create: {
        name: catalogItem.name,
        departmentId,
        monthlyPrice: catalogItem.monthlyPrice,
        hoursPerMonth: catalogItem.hoursPerMonth,
        internalHourlyCost: catalogItem.internalHourlyCost,
        monthlyCost,
        monthlyMargin,
        marginPercentage,
        baseHours: catalogItem.baseHours,
        basePrice: catalogItem.basePrice,
        isActive: true
      }
    })
    catalogMap.set(catalogItem.name, catalog.id)
    console.log(`✅ Catalog: ${catalog.name}`)
  }

  // 5. Criar Custos Fixos Mensais da Empresa (Gastos)
  const fixedCostsData = [
    {
      name: 'Aluguel Escritório Lisboa',
      category: 'Aluguel',
      monthlyAmount: 3500,
      description: 'Escritório principal em Lisboa',
    },
    {
      name: 'Eletricidade, Água e Internet',
      category: 'Utilidades',
      monthlyAmount: 850,
      description: 'Custos de luz, água e internet do escritório',
    },
    {
      name: 'Softwares de Produtividade',
      category: 'Software',
      monthlyAmount: 1200,
      description: 'Licenças Adobe, Notion, Google Workspace, Slack, etc.',
    },
    {
      name: 'Softwares de Marketing',
      category: 'Software',
      monthlyAmount: 900,
      description: 'Ferramentas de automação, analytics e gestão de campanhas',
    },
    {
      name: 'Viaturas Comerciais',
      category: 'Viaturas',
      monthlyAmount: 600,
      description: 'Leasing e despesas fixas de viaturas',
    },
    {
      name: 'Outros Custos Operacionais',
      category: 'Outros',
      monthlyAmount: 750,
      description: 'Seguros, contabilidade e outras despesas recorrentes',
    }
  ]

  const now = new Date()

  for (const cost of fixedCostsData) {
    await prisma.fixedCost.create({
      data: {
        name: cost.name,
        category: cost.category as any,
        monthlyAmount: cost.monthlyAmount,
        description: cost.description,
        isActive: true,
        startDate: now,
        endDate: null
      }
    })
  }

  // 6. Criar Avenças Ativas
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const retainersData = [
    {
      name: 'Cliente A - Redes Sociais',
      departmentName: 'Marketing Digital & Performance',
      catalogName: 'Gestão Redes Sociais - Básico',
      quantity: 1,
      startDate: new Date(currentYear, 0, 1), // Janeiro
      notes: 'Cliente ativo desde janeiro'
    },
    {
      name: 'Cliente B - Redes Sociais Premium',
      departmentName: 'Marketing Digital & Performance',
      catalogName: 'Gestão Redes Sociais - Premium',
      quantity: 1,
      startDate: new Date(currentYear, 2, 1), // Março
      notes: 'Upgrade para premium'
    },
    {
      name: 'Cliente C - Identidade Visual',
      departmentName: 'Branding & Design',
      catalogName: 'Identidade Visual Completa',
      quantity: 1,
      startDate: new Date(currentYear - 1, 11, 1), // Dezembro do ano anterior
      notes: 'Projeto em andamento'
    },
    {
      name: 'Cliente D - Website',
      departmentName: 'Web / UX / Dev',
      catalogName: 'Website WordPress',
      quantity: 2,
      startDate: new Date(currentYear, 0, 15),
      notes: 'Dois sites em manutenção'
    },
    {
      name: 'Cliente E - Vídeo',
      departmentName: 'Vídeo & Fotografia',
      catalogName: 'Vídeo Institucional',
      quantity: 1,
      startDate: new Date(currentYear, 1, 1), // Fevereiro
      notes: 'Produção mensal'
    },
    {
      name: 'Cliente F - Custom',
      departmentName: 'Branding & Design',
      catalogName: null,
      monthlyPrice: 1500,
      quantity: 1,
      startDate: new Date(currentYear, 3, 1), // Abril
      notes: 'Avença customizada sem catálogo'
    }
  ]

  for (const retainerData of retainersData) {
    const departmentId = departmentMap.get(retainerData.departmentName)
    if (!departmentId) continue

    let monthlyPrice = retainerData.monthlyPrice
    let catalogId = null

    if (retainerData.catalogName) {
      catalogId = catalogMap.get(retainerData.catalogName) || null
      if (catalogId) {
        const catalog = await prisma.retainerCatalog.findUnique({
          where: { id: catalogId }
        })
        if (catalog) {
          monthlyPrice = Number(catalog.monthlyPrice)
        }
      }
    }

    if (!monthlyPrice) continue

    const monthlyRevenue = monthlyPrice * retainerData.quantity

    // Verificar se já existe
    const existing = await prisma.retainer.findFirst({
      where: {
        name: retainerData.name,
        departmentId: departmentId
      }
    })

    if (existing) {
      await prisma.retainer.update({
        where: { id: existing.id },
        data: {
          catalogId: catalogId || undefined,
          monthlyPrice,
          quantity: retainerData.quantity,
          monthlyRevenue,
          notes: retainerData.notes || undefined,
          isActive: true
        }
      })
    } else {
      await prisma.retainer.create({
        data: {
          departmentId,
          catalogId: catalogId || undefined,
          name: retainerData.name,
          monthlyPrice,
          quantity: retainerData.quantity,
          monthlyRevenue,
          startDate: retainerData.startDate,
          notes: retainerData.notes || undefined,
          isActive: true
        }
      })
    }
    console.log(`✅ Retainer: ${retainerData.name} (${retainerData.quantity}x €${monthlyPrice}/mês)`)
  }

  // 7. Criar Horas Planejadas e Objetivos para os últimos 6 meses
  const monthsToFill = 6
  const startMonth = currentMonth - monthsToFill + 1
  const startYear = startMonth <= 0 ? currentYear - 1 : currentYear
  const adjustedStartMonth = startMonth <= 0 ? startMonth + 12 : startMonth

  for (let i = 0; i < monthsToFill; i++) {
    let month = adjustedStartMonth + i
    let year = startYear
    
    if (month > 12) {
      month = month - 12
      year = year + 1
    }

    for (const [deptName, deptId] of departmentMap.entries()) {
      const dept = await prisma.department.findUnique({ where: { id: deptId } })
      if (!dept) continue

      // Horas Planejadas
      const targetAvailableHours = 
        dept.billableHeadcount * 
        160 * 
        Number(dept.targetUtilization)

      // Horas reais (simuladas - 80% a 120% do target)
      const utilizationVariation = 0.8 + Math.random() * 0.4 // 0.8 a 1.2
      const actualBillableHours = targetAvailableHours * utilizationVariation

      // Receita de projetos (simulada)
      const projectRevenue = Math.random() * 5000 + 2000 // Entre 2000 e 7000

      await prisma.plannedHours.upsert({
        where: {
          departmentId_month_year: {
            departmentId: deptId,
            month,
            year
          }
        },
        update: {
          billableHeadcount: dept.billableHeadcount,
          targetHoursPerMonth: 160,
          targetUtilization: dept.targetUtilization,
          targetAvailableHours,
          actualBillableHours,
          projectRevenue
        },
        create: {
          departmentId: deptId,
          month,
          year,
          billableHeadcount: dept.billableHeadcount,
          targetHoursPerMonth: 160,
          targetUtilization: dept.targetUtilization,
          targetAvailableHours,
          actualBillableHours,
          projectRevenue
        }
      })

      // Objetivos (baseado no mínimo anual / 12, com variação)
      const baseObjective = dept.minimumRevenueAnnual 
        ? Number(dept.minimumRevenueAnnual) / 12 
        : 10000
      const objectiveVariation = 0.9 + Math.random() * 0.2 // 0.9 a 1.1
      const targetValue = baseObjective * objectiveVariation

      await prisma.objective.upsert({
        where: {
          departmentId_month_year: {
            departmentId: deptId,
            month,
            year
          }
        },
        update: {
          targetValue
        },
        create: {
          departmentId: deptId,
          month,
          year,
          targetValue
        }
      })
    }
    console.log(`✅ Data for ${month}/${year} created`)
  }

  // 8. Calcular Resultados para os meses preenchidos
  const { calculateDepartmentResult } = await import('../src/lib/business-logic/calculations')
  
  for (let i = 0; i < monthsToFill; i++) {
    let month = adjustedStartMonth + i
    let year = startYear
    
    if (month > 12) {
      month = month - 12
      year = year + 1
    }

    for (const deptId of departmentMap.values()) {
      try {
        await calculateDepartmentResult(deptId, month, year)
      } catch (error) {
        console.error(`Error calculating result for dept ${deptId}, ${month}/${year}:`, error)
      }
    }
  }

  console.log('✅ Results calculated')

  console.log('\n🎉 Seeding completed!')
  console.log(`\n📊 Resumo:`)
  console.log(`   - Usuários preservados (nenhum usuário criado/alterado)`)
  console.log(`   - Configurações Globais: ${settings.length}`)
  console.log(`   - Departamentos: ${departmentMap.size}`)
  console.log(`   - Catálogo Avenças: ${catalogMap.size}`)
  console.log(`   - Custos Fixos: ${fixedCostsData.length}`)
  console.log(`   - Avenças Ativas: ${retainersData.length}`)
  console.log(`   - Meses com dados: ${monthsToFill}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

