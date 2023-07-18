import { Button } from '@/components/ui/button'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDuration } from '@/lib/time'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DatePickerWithRange } from './edit-date'

type Props = {
  searchParams: {
    from: string
    to: string
  }
}

const getDates = (from: string, to: string) => {
  // default to start of week
  const startOfWeek = new Date(
    new Date().setDate(new Date().getDate() - new Date().getDay())
  ).toISOString()
  const endOfWeek = new Date(
    new Date().setDate(new Date().getDate() - new Date().getDay() + 6)
  ).toISOString()

  const fromDate = new Date(from || startOfWeek)
  if (fromDate.toString() === 'Invalid Date') {
    throw new Error(`Invalid 'from' date, please use ISO format.`)
  }
  const toDate = new Date(to || endOfWeek)
  if (toDate.toString() === 'Invalid Date') {
    throw new Error(`Invalid 'to' date, please use ISO format.`)
  }
  if (fromDate > toDate) {
    throw new Error(`'from' date must be before 'to' date.`)
  }

  fromDate.setHours(0, 0, 0, 0)
  toDate.setHours(23, 59, 59, 999)

  return { from: fromDate, to: toDate }
}

export default async function AnalyticsPage({
  searchParams: { from: fromUnparsed, to: toUnparsed }
}: Props) {
  const { from, to } = getDates(fromUnparsed, toUnparsed)
  const user = await getUserSession()
  console.log('From', from, 'To', to)
  const activities = await prisma.activity.findMany({
    where: {
      tenantId: user.tenant.id,
      startAt: {
        gte: from,
        lte: to
      }
    }
  })

  async function reload(data: FormData) {
    'use server'
    revalidatePath('/analytics')
    redirect(`/analytics?from=${data.get('from')}&to=${data.get('to')}`)
  }

  return (
    <div className="mx-auto container py-4">
      <h1 className="text-lg font-medium mb-2">Analytics</h1>
      <form action={reload} className="flex items-center gap-4">
        <DatePickerWithRange from={from} to={to} />
        <Button type="submit">Update</Button>
      </form>
      {activities.length > 0 && (
        <ul className="divide-y">
          {activities.map((activity) => (
            <li key={activity.id} className="py-2">
              {activity.name} -{' '}
              {getDuration(activity.startAt, activity.endAt || new Date())}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
