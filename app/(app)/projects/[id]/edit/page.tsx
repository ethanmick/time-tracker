import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

  async function editProject(data: FormData) {
    'use server'

    await prisma.project.updateMany({
      where: {
        id: params.id,
        tenantId: user.tenant.id
      },
      data: {
        name: data.get('name') as string,
        color: data.get('color') as string
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
          <Button type="submit">Save Project</Button>
        </div>
      </form>
    </div>
  )
}
