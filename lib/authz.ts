import { User } from '@prisma/client'

export const isAdmin = (user: User | null | undefined): boolean =>
  !!user && (user.role === 'ADMIN' || user.role === 'OWNER')
