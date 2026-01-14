import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.name = user.name
      }
      
      // Quando a sessão for atualizada (via update()), buscar dados atualizados do banco
      if (trigger === 'update' && token.id) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, email: true, role: true }
        })
        
        if (updatedUser) {
          token.name = updatedUser.name
          token.email = updatedUser.email
          token.role = updatedUser.role
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string | null
        session.user.email = token.email as string
      }
      return session
    }
  },
  pages: {
    signIn: '/'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
}

