import { Button } from '@/components/ui/button'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ProjectList } from '../projects'

export default async function ProjectsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()
  const projects = await prisma.project.findMany({
    where: {
      tenantId: user.tenant.id
    },
    orderBy: {
      createdAt: 'asc'
    }
  })
  return (
    <div className="container mx-auto flex gap-4 divide-x-2 py-4">
      <div className="w-1/2 px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">Project List</h2>
          <Button asChild>
            <Link href="/projects/new">Create Project</Link>
          </Button>
        </div>

        <ProjectList projects={projects} />
      </div>
      <div className="px-4 flex-grow">{children}</div>
    </div>
  )
}
