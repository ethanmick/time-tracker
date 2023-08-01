import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger
} from '@/components/ui/select'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Activity, Client, Project } from '@prisma/client'
import { Building2, FolderOpenDot, Play, Square } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { ActivityItemRow } from './activity-item-row'
import { ActivityDuration } from './duration'

type TimeProps = {
  startAt: string
}

type NewActivityProps = {
  activity?: Activity | null
  clients: Client[]
  projects: Project[]
}

const NewActivity = ({ activity, clients, projects }: NewActivityProps) => {
  async function upsertActivity(data: FormData) {
    'use server'
    const user = await getUserSession()
    const client = data.get('client') as string
    const project = data.get('project') as string

    await prisma.activity.upsert({
      where: {
        id: data.get('id') as string
      },
      create: {
        user: { connect: { id: user.id } },
        tenant: { connect: { id: user.tenant.id } },
        name: data.get('name') as string,
        startAt: new Date(),
        client: !!client ? { connect: { id: client } } : undefined,
        project: !!project ? { connect: { id: project } } : undefined
      },
      update: {
        name: data.get('name') as string,
        client: !!client ? { connect: { id: client } } : undefined,
        project: !!project ? { connect: { id: project } } : undefined
      }
    })
    revalidatePath('/track')
  }

  async function stopActivity(data: FormData) {
    'use server'

    const client = data.get('client') as string
    const project = data.get('project') as string

    await prisma.activity.update({
      where: {
        id: data.get('id') as string
      },
      data: {
        endAt: new Date(),
        name: data.get('name') as string,
        client: !!client ? { connect: { id: client } } : undefined,
        project: !!project ? { connect: { id: project } } : undefined
      }
    })
    revalidatePath('/track')
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-2">What are you working on?</h2>
      <form action={activity ? stopActivity : upsertActivity} className="">
        <div className="flex items-center space-x-4">
          <Input type="text" name="name" defaultValue={activity?.name || ''} />
          <input type="hidden" name="id" defaultValue={activity?.id || ''} />
          <Select name="client">
            <SelectTrigger className="w-[50px]">
              <Building2 size={32} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Client</SelectLabel>
                <SelectItem value="">None</SelectItem>
                {clients.map((client) => (
                  <SelectItem value={client.id} key={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select name="project">
            <SelectTrigger className="w-[50px]">
              <FolderOpenDot size={32} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Project</SelectLabel>
                <SelectItem value="">None</SelectItem>
                {projects.map((project) => (
                  <SelectItem value={project.id} key={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {activity && <ActivityDuration startAt={activity.startAt} />}
          <Button
            type="submit"
            variant="outline"
            className={cn('rounded-full px-2 h-[40px] w-[40px]')}
          >
            {activity ? <Square size={20} /> : <Play size={20} />}
          </Button>
        </div>
      </form>
    </div>
  )
}

type DailyActivitiesProps = {
  activities: Activity[]
}

const DailyActivities = ({ activities }: DailyActivitiesProps) => {
  return (
    <div>
      <h2 className="text-lg font-medium mb-2">What you&apos;ve done today.</h2>
      <ul>
        {activities.map((activity) => (
          <ActivityItemRow activity={activity} key={activity.id} />
        ))}
      </ul>
    </div>
  )
}

export default async function TrackPage() {
  const user = await getUserSession()
  const currentActivity = await prisma.activity.findFirst({
    where: {
      tenantId: user.tenant.id,
      userId: user.id,
      endAt: null
    }
  })

  const clients = await prisma.client.findMany({
    where: {
      tenantId: user.tenant.id
    }
  })

  const projects = await prisma.project.findMany({
    where: {
      tenantId: user.tenant.id
    }
  })

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59
  )

  const dailyActivities = await prisma.activity.findMany({
    where: {
      tenantId: user.tenant.id,
      userId: user.id,
      startAt: {
        gte: startOfToday
      },
      endAt: {
        lte: endOfToday
      }
    },
    orderBy: {
      startAt: 'asc'
    }
  })

  return (
    <div className="mx-auto container py-4 space-y-12">
      <NewActivity
        activity={currentActivity}
        clients={clients}
        projects={projects}
      />
      <DailyActivities activities={dailyActivities} />
    </div>
  )
}
