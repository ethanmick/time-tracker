import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ClientPageProps = {
  params: {
    id: string
  }
}

export default async function ClientEditPage({ params }: ClientPageProps) {
  const user = await getUserSession()
  const client = await prisma.client.findFirst({
    where: {
      tenantId: user.tenant.id,
      id: params.id
    }
  })

  if (!client) {
    return redirect('/clients')
  }

  async function editClient(data: FormData) {
    'use server'
    if (!client) return redirect('/clients')

    const user = await getUserSession()
    await prisma.client.updateMany({
      where: {
        tenant: {
          id: user.tenant.id
        },
        id: client.id
      },
      data: {
        name: data.get('name') as string,
        color: data.get('color') as string
      }
    })
    revalidatePath(`/clients/${client.id}`)
    redirect(`/clients/${client.id}`)
  }

  return (
    <form action={editClient}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium mb-2">Edit Client</h2>
        <Button type="submit">Save</Button>
      </div>
      <div className="flex items-center gap-4">
        <input type="hidden" defaultValue={client.id} />
        <Input
          type="color"
          name="color"
          placeholder="Color"
          className="w-12"
          defaultValue={client.color || ''}
        />
        <Input
          type="text"
          name="name"
          placeholder="Client name"
          className="w-full"
          defaultValue={client.name || ''}
        />
      </div>
    </form>
  )
}
