import { session } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth/next'
import GoogleProvider from 'next-auth/providers/google'
import { cookies } from 'next/headers'

const authOption: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (!profile?.email) {
        throw new Error('No profile')
      }

      const inviteKey = cookies().get('invite_key')?.value
      await prisma.user.upsert({
        where: {
          email: profile.email
        },
        create: {
          email: profile.email,
          name: profile.name,
          avatar: (profile as any).picture,
          role: inviteKey ? 'USER' : 'OWNER',
          tenant: inviteKey
            ? {
                connect: {
                  inviteKey
                }
              }
            : {
                create: {}
              }
        },
        update: {
          name: profile.name,
          avatar: (profile as any).picture
        }
      })

      cookies().delete('invite_key')
      return true
    },
    session,
    async jwt({ token, user, account, profile }) {
      console.log({ token, account, profile, user })
      if (profile) {
        const user = await prisma.user.findUnique({
          where: {
            email: profile.email
          }
        })
        if (!user) {
          throw new Error('No user found')
        }
        token.id = user.id
        token.tenant = {
          id: user.tenantId
        }
      }
      return token
    }
  }
}

const handler = NextAuth(authOption)
export { handler as GET, handler as POST }
