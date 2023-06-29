import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cn } from '@/lib/utils'
import { Activity } from '@prisma/client'
import { Play, Square } from 'lucide-react'
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
      <h2 className="font-semibold mb-2">What are you working on?</h2>
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

const DailyActivities = () => {}

export default async function TrackPage() {
  const user = await getUserSession()
  const currentActivity = await prisma.activity.findFirst({
    where: {
      tenantId: user.tenant.id,
      userId: user.id,
      endAt: null
    }
  })

  return (
    <main className="mx-auto container py-4">
      <NewActivity activity={currentActivity} />
    </main>
  )
}
