import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getUserSession } from '@/lib/auth'
import { isAdmin } from '@/lib/authz'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import { UpdateRoleForm } from './update-form'

const vercel = process.env.NEXT_PUBLIC_VERCEL_URL
const DOMAIN = vercel ? `https://${vercel}` : 'http://localhost:3000'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')

const InviteLink = async () => {
  const user = await getUserSession()
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: user.tenant.id
    }
  })

  return (
    <div className="py-4 space-y-4">
      <h2 className="text-xl">Invite Link</h2>
      <input
        defaultValue={`${DOMAIN}/invite/${tenant?.inviteKey}`}
        className="border-1 bg-stone-200 py-2 px-4 rounded-xl w-full"
        readOnly
      />
    </div>
  )
}

export default async function TeamPage() {
  async function updateUserRole({ id, role }: { id: string; role: Role }) {
    'use server'
    const session = await getUserSession()
    const user = await prisma.user.findUnique({
      where: {
        id: session.id
      }
    })
    if (!isAdmin(user)) {
      throw new Error('Unauthorized')
    }
    if (user?.role === 'OWNER' && user.id === id) {
      throw new Error('Cannot update owner role')
    }
    await prisma.user.update({
      where: {
        id
      },
      data: {
        role
      }
    })
  }

  const user = await getUserSession()
  const users = await prisma.user.findMany({
    where: {
      tenantId: user.tenant.id
    }
  })

  return (
    <div>
      <h1 className="text-3xl mb-4">Team</h1>
      <InviteLink />
      <h2 className="text-xl font-semibold mb-8">Your Team</h2>
      <ul className="w-full divide-y divide-neutral-200/50">
        {users.map((user) => (
          <li
            key={user.id}
            className="grid grid-cols-[80px_minmax(500px,_1fr)_100px] py-4"
          >
            <div>
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar || ''} />
                <AvatarFallback>{getInitials(user.name || '')}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-lg font-semibold">{user.name}</span>
              <span className="text-slate-600">{user.email}</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <UpdateRoleForm
                id={user.id}
                role={user.role}
                onRoleUpdate={updateUserRole}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
