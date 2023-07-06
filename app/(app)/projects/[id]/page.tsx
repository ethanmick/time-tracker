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
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default async function ProjectDetailPage({
  params
}: {
  params: { id: string }
}) {
  const user = await getUserSession()
  const project = await prisma.project.findFirst({
    where: {
      id: params.id,
      tenantId: user.tenant.id
    },
    include: {
      client: true
    }
  })

  async function deleteProject() {
    'use server'
    if (!project) notFound()

    await prisma.project.deleteMany({
      where: {
        tenantId: user.tenant.id,
        id: params.id
      }
    })

    revalidatePath('/projects')
    redirect('/projects')
  }

  if (!project) {
    throw notFound()
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>Project Detail</h1>
        <Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreHorizontal />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link className="w-full" href={`/projects/${project.id}/edit`}>
                  Edit
                </Link>
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
              <DialogTitle>Do you want to delete this project?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Are you sure you want to
                permanently delete this project?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <form action={deleteProject}>
                <Button type="submit" variant="destructive">
                  Delete
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div>{project.name}</div>
      {project.client && (
        <div>
          <h2>Client</h2>
          <div>{project.client.name}</div>
        </div>
      )}
    </div>
  )
}
