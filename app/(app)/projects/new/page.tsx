import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export default async function CreateProjectPage() {
  async function createProject(data: FormData) {
    'use server'
    const user = await getUserSession()

    const project = await prisma.project.create({
      data: {
        tenantId: user.tenant.id,
        name: data.get('name') as string,
        color: data.get('color') as string
      }
    })

    revalidatePath(`/projects`)
    redirect(`/projects/${project.id}`)
  }

  return (
    <form
      action={createProject}
      className="max-w-3xl mx-auto pt-4 gap-4 flex flex-col"
    >
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email">Name</Label>
        <Input
          type="text"
          name="name"
          id="name"
          placeholder="Project Name"
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
        />
      </div>
      <div>
        <Button type="submit">Create Project</Button>
      </div>
    </form>
  )
}
