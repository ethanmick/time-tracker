import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Activity } from '@prisma/client'
import { revalidatePath } from 'next/cache'

type TimeProps = {
  startAt: string
}

const Time = ({ startAt }: TimeProps) => {
  const date = new Date(startAt)
  const now = new Date()
  const elapsed = now.getTime() - date.getTime()
  return <div>{elapsed}</div>
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
      <h2>What are you working on?</h2>
      <form
        action={activity ? stopActivity : startActivity}
        className="flex items-center space-x-4"
      >
        <Input type="text" name="name" defaultValue={activity?.name || ''} />
        <input type="hidden" name="id" defaultValue={activity?.id || ''} />
        {activity && <Time startAt={activity.startAt.toString()} />}
        <Button type="submit">{activity ? 'Stop' : 'Start'}</Button>
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
