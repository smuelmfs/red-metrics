/**
 * Script para criar um usuário no banco de dados
 * 
 * Execute com: npm run db:create-user
 * 
 * Ou com parâmetros customizados:
 * npx tsx prisma/create-user.ts admin@example.com "Admin User" admin123 ADMIN
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Pegar argumentos da linha de comando ou usar valores padrão
  const args = process.argv.slice(2)
  const email = args[0] || 'admin@redagency.com'
  const name = args[1] || 'Administrador'
  const password = args[2] || 'admin123'
  const role = (args[3] || 'ADMIN').toUpperCase() as 'ADMIN' | 'USER'

  if (role !== 'ADMIN' && role !== 'USER') {
    console.error('❌ Role deve ser ADMIN ou USER')
    process.exit(1)
  }

  console.log('👤 Criando usuário...')
  console.log(`   Email: ${email}`)
  console.log(`   Nome: ${name}`)
  console.log(`   Role: ${role}`)
  console.log(`   Senha: ${password}`)
  console.log('')

  try {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('⚠️  Usuário já existe! Atualizando...')
      
      const hashedPassword = await bcrypt.hash(password, 10)
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name,
          password: hashedPassword,
          role
        }
      })

      console.log('✅ Usuário atualizado com sucesso!')
      console.log(`   ID: ${updatedUser.id}`)
      console.log(`   Email: ${updatedUser.email}`)
      console.log(`   Nome: ${updatedUser.name}`)
      console.log(`   Role: ${updatedUser.role}`)
    } else {
      const hashedPassword = await bcrypt.hash(password, 10)
      
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role
        }
      })

      console.log('✅ Usuário criado com sucesso!')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Nome: ${user.name}`)
      console.log(`   Role: ${user.role}`)
    }

    console.log('')
    console.log('💡 Você pode fazer login com:')
    console.log(`   Email: ${email}`)
    console.log(`   Senha: ${password}`)
  } catch (error: any) {
    console.error('❌ Erro ao criar usuário:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

