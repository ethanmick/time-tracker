'use client'

import { DonutChart } from '@tremor/react'

type ChartProps = {
  data: any[]
}

const hourFormatter = (number: number) => `${number.toFixed(2)} hours`

export const ClientChart = ({ data }: ChartProps) => {
  return (
    <DonutChart
      className="mt-6"
      data={data}
      category="duration"
      index="name"
      valueFormatter={hourFormatter}
      colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
    />
  )
}

export const ActivityChart = ({ data }: ChartProps) => {
  return (
    <DonutChart
      className="mt-6"
      data={data}
      category="duration"
      index="name"
      valueFormatter={hourFormatter}
      colors={['slate', 'violet', 'indigo', 'rose', 'cyan', 'amber']}
    />
  )
}
