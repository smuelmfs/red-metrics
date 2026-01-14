import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Criar usuário admin padrão
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

  // Criar configurações globais
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

  // Criar departamentos de exemplo (opcional)
  const departments = [
    {
      name: 'Branding & Design',
      code: 'DESIGN',
      billableHeadcount: 4,
      averageHourlyRate: 45,
      targetUtilization: 0.65
    },
    {
      name: 'Web / UX / Dev',
      code: 'WEB',
      billableHeadcount: 4,
      averageHourlyRate: 55,
      targetUtilization: 0.65
    },
    {
      name: 'Marketing Digital & Performance',
      code: 'MARKETING',
      billableHeadcount: 3,
      averageHourlyRate: 50,
      targetUtilization: 0.65
    }
  ]

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    })
  }

  console.log('✅ Example departments created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

