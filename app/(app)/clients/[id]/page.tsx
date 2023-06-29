import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type ClientPageProps = {
  params: {
    id: string
  }
}

export default async function ClientPage({ params }: ClientPageProps) {
  const user = await getUserSession()
  const client = await prisma.client.findFirst({
    where: {
      tenantId: user.tenant.id,
      id: params.id
    }
  })

  if (!client) {
    return <div>Client not found</div>
  }

  async function deleteClient() {
    'use server'
    if (!client) throw new Error('client not found')
    await prisma.client.deleteMany({
      where: {
        tenantId: user.tenant.id,
        id: client.id
      }
    })
    redirect('/clients')
  }

  return (
    <div className="">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium mb-2">Client</h2>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href={`/clients/${client.id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DialogTrigger asChild>
                <DropdownMenuItem className="text-red-500">
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Do you want to delete this client?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to
                permanently delete this client?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <form action={deleteClient}>
                <Button type="submit" variant="destructive">
                  Delete
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <h3>{client.name}</h3>
    </div>
  )
}
