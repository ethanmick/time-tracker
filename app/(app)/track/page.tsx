import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Activity } from '@prisma/client'
import { ArrowRight, Play, Square } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import { ActivityDuration } from './duration'

type TimeProps = {
  startAt: string
}

type NewActivityProps = {
  activity?: Activity | null
}

const NewActivity = ({ activity }: NewActivityProps) => {
  async function startActivity(data: FormData) {
    'use server'
    const user = await getUserSession()
    await prisma.activity.create({
      data: {
        user: { connect: { id: user.id } },
        tenant: { connect: { id: user.tenant.id } },
        name: data.get('name') as string,
        startAt: new Date()
      }
    })
    revalidatePath('/track')
  }

  async function stopActivity(data: FormData) {
    'use server'
    await prisma.activity.update({
      where: {
        id: data.get('id') as string
      },
      data: {
        endAt: new Date()
      }
    })
    revalidatePath('/track')
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-2">What are you working on?</h2>
      <form action={activity ? stopActivity : startActivity} className="">
        <div className="flex items-center space-x-4">
          <Input type="text" name="name" defaultValue={activity?.name || ''} />
          <input type="hidden" name="id" defaultValue={activity?.id || ''} />
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
      <h2 className="text-lg font-medium mb-2">What you've done today.</h2>
      <ul>
        {activities.map((activity) => (
          <li className="py-2 space-x-2 flex items-center" key={activity.id}>
            <span className="w-1/2">{activity.name}</span>
            <span>
              {new Intl.DateTimeFormat(undefined, {
                hour: 'numeric',
                minute: 'numeric'
              }).format(activity.startAt)}
            </span>
            <ArrowRight size={16} />
            <span>
              {new Intl.DateTimeFormat(undefined, {
                hour: 'numeric',
                minute: 'numeric'
              }).format(activity.endAt || new Date())}
            </span>
          </li>
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
      OR: [
        {
          startAt: {
            equals: startOfToday
          }
        },
        {
          endAt: {
            lte: endOfToday
          }
        }
      ]
    },
    orderBy: {
      startAt: 'asc'
    }
  })

  console.log('dailyActivities', dailyActivities)

  return (
    <main className="mx-auto container py-4 space-y-12">
      <NewActivity activity={currentActivity} />
      <DailyActivities activities={dailyActivities} />
    </main>
  )
}
