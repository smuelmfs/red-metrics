import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Se tentando alterar senha, validar senha atual
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Senha atual é obrigatória para alterar a senha' },
          { status: 400 }
        )
      }

      const isPasswordValid = await compare(currentPassword, user.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 }
        )
      }

      // Hash da nova senha
      const hashedPassword = await hash(newPassword, 10)

      // Atualizar nome e senha
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          ...(name && { name }),
          password: hashedPassword
        }
      })
    } else if (name) {
      // Apenas atualizar nome
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar perfil' },
      { status: 500 }
    )
  }
}

