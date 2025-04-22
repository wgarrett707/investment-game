import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from '@/lib/prisma'
import { Adapter } from 'next-auth/adapters'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Define custom types for the user and session
declare module 'next-auth' {
  interface User {
    role: string
    teamId?: string | null
  }
  interface Session {
    user: User & {
      role: string
      teamId?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    teamId?: string | null
  }
}

// Ensure we have a secret
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide process.env.NEXTAUTH_SECRET')
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error('Missing credentials')
            return null
          }

          console.log('Attempting to find user:', credentials.email)
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.error('User not found:', credentials.email)
            throw new Error('Invalid credentials')
          }

          if (!user.password) {
            console.error('User has no password:', credentials.email)
            throw new Error('Invalid credentials')
          }

          console.log('Comparing passwords for user:', credentials.email)
          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isCorrectPassword) {
            console.error('Invalid password for user:', credentials.email)
            throw new Error('Invalid credentials')
          }

          console.log('Login successful for user:', credentials.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            teamId: user.teamId,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
          teamId: user.teamId,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
          teamId: token.teamId,
        }
      }
    }
  },
  debug: true // Enable debug mode to see more detailed errors
} 