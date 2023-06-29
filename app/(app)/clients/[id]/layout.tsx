import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ClientList, ClientListHeader } from '../clients'

export default async function ClientLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()
  const clients = await prisma.client.findMany({
    where: {
      tenantId: user.tenant.id
    }
  })
  return (
    <div className="container mx-auto flex gap-4 divide-x-2 py-4">
      <div className="w-1/2 px-4">
        <ClientListHeader />
        <ClientList clients={clients} />
      </div>
      <div className="px-4">{children}</div>
    </div>
  )
}
