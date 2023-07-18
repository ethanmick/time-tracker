import { User, getServerSession } from 'next-auth'

export const session = async ({ session, token }: any) => {
  session.user.id = token.id
  session.user.tenant = token.tenant
  return session
}

export const getUserSession = async (): Promise<User> => {
  const authUserSession = await getServerSession({
    callbacks: {
      session
    }
  })
  if (!authUserSession) throw new Error('unauthorized')
  return authUserSession.user
}
