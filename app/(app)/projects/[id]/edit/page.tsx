import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'

export default async function EditProjectPage({
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

  const clients = (
    await prisma.client.findMany({
      where: {
        tenantId: user.tenant.id
      }
    })
  ).map((client) => ({
    value: client.id,
    label: client.name
  }))

  async function editProject(data: FormData) {
    'use server'

    const client = data.get('client') as string

    await prisma.project.updateMany({
      where: {
        id: params.id,
        tenantId: user.tenant.id
      },
      data: {
        name: data.get('name') as string,
        color: data.get('color') as string,
        clientId: client ? client : null
      }
    })

    revalidatePath(`/projects/${params.id}`)
    redirect(`/projects/${params.id}`)
  }

  if (!project) notFound()

  return (
    <div>
      <h1>Edit Project</h1>

      <form
        action={editProject}
        className="max-w-3xl mx-auto pt-4 gap-4 flex flex-col"
      >
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Name</Label>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="Project Name"
            defaultValue={project.name}
            required
          />
        </div>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Color</Label>
          <Input
            type="color"
            id="name"
            name="color"
            placeholder="Project Color"
            defaultValue={project.color || ''}
          />
        </div>
        <div>
          <Label htmlFor="email">Client</Label>
          <Select name="client" defaultValue={project.clientId ?? ''}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Assign a Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Client</SelectLabel>
                <SelectItem value="">None</SelectItem>
                {clients.map((client) => (
                  <SelectItem value={client.value} key={client.value}>
                    {client.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button type="submit">Save Project</Button>
        </div>
      </form>
    </div>
  )
}
