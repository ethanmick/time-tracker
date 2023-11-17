import { Button } from '@/components/ui/button'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDuration, getDurationInMilliseconds } from '@/lib/time'
import { Activity } from '@prisma/client'
import { Card, Title } from '@tremor/react'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActivityChart, ClientChart } from './charts'
import { DatePickerWithRange } from './edit-date'

type Props = {
  searchParams: {
    from: string
    to: string
  }
}

const totalActivitiesDuration = (activities: Activity[]) =>
  activities.reduce(
    (total, activity) =>
      total +
      (activity.endAt || new Date()).getTime() -
      activity.startAt.getTime(),
    0
  ) /
  1000 /
  60 /
  60

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
  searchParams: { from: fromUnparsed, to: toUnparsed },
}: Props) {
  async function reload(data: FormData) {
    'use server'
    revalidatePath('/analytics')
    redirect(`/analytics?from=${data.get('from')}&to=${data.get('to')}`)
  }

  const { from, to } = getDates(fromUnparsed, toUnparsed)
  const user = await getUserSession()

  const clients = await prisma.client.findMany({
    where: {
      tenantId: user.tenant.id,
      activities: {
        some: {
          startAt: {
            gte: from,
          },
          endAt: {
            lte: to,
          },
        },
      },
    },
    include: {
      activities: {
        where: {
          startAt: {
            gte: from,
          },
          endAt: {
            lte: to,
          },
        },
      },
    },
  })

  const nullClientActivities = await prisma.activity.findMany({
    where: {
      tenantId: user.tenant.id,
      clientId: null,
      startAt: {
        gte: from,
      },
      endAt: {
        lte: to,
      },
    },
  })

  const clientData = [
    {
      name: 'No Client',
      duration: totalActivitiesDuration(nullClientActivities),
    },
    ...clients.map((client) => ({
      name: client.name,
      duration: totalActivitiesDuration(client.activities),
    })),
  ]

  const activityChartData: Record<string, number> = {}
  ;[...nullClientActivities, ...clients.flatMap((c) => c.activities)].forEach(
    (activity) => {
      const key = activity.name || '(No name)'
      const ms = activityChartData[key] || 0
      activityChartData[key] =
        ms +
        getDurationInMilliseconds(
          activity.startAt,
          activity.endAt || new Date()
        )
    }
  )

  return (
    <div className="mx-auto container grid grid-cols-2 gap-4 pt-4">
      <div className="space-y-4">
        <h1 className="text-lg font-medium mb-2">Analytics</h1>
        <form action={reload} className="flex items-center gap-4">
          <DatePickerWithRange from={from} to={to} />
          <Button type="submit">Update</Button>
        </form>
        {nullClientActivities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold">No client</h2>
            <ul className="divide-y">
              {nullClientActivities.map((activity) => (
                <li key={activity.id} className="py-2">
                  {activity.name} -{' '}
                  {getDuration(activity.startAt, activity.endAt || new Date())}
                </li>
              ))}
            </ul>
          </div>
        )}
        {clients.length > 0 && (
          <ul className="">
            {clients.map((client) => (
              <li key={client.id}>
                <h2 className="text-lg font-semibold">{client.name}</h2>
                <ul>
                  {client.activities.map((activity) => (
                    <li key={activity.id} className="py-2">
                      {activity.name} -{' '}
                      {getDuration(
                        activity.startAt,
                        activity.endAt || new Date()
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="space-y-4">
        <h2>Charts</h2>
        <Card className="max-w-lg">
          <Title>Client Breakdown</Title>
          <ClientChart data={clientData} />
        </Card>
        <Card className="max-w-lg">
          <Title>Activity Breakdown</Title>
          <ActivityChart
            data={Object.entries(activityChartData).map(([name, duration]) => ({
              name,
              duration: duration / 1000 / 60 / 60,
            }))}
          />
        </Card>
      </div>
    </div>
  )
}
