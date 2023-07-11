import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const vercel = process.env.NEXT_PUBLIC_VERCEL_URL
const DOMAIN = vercel ? `https://${vercel}` : 'http://localhost:3000'

const InviteLink = async () => {
  const user = await getUserSession()
  const tenant = await prisma.tenant.findUnique({
    where: {
      id: user.tenant.id
    }
  })

  console.log('Teantn', tenant)

  return (
    <div className="p-4 space-y-4">
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
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} : {user.email} -- {user.role}
          </li>
        ))}
      </ul>
    </div>
  )
}
