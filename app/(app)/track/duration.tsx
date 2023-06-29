'use client'

import { useEffect, useState } from 'react'

const pad = (n: number) => n.toString().padStart(2, '0')

type Props = {
  startAt: Date
}

export const ActivityDuration = ({ startAt }: Props) => {
  const now = new Date()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = now.getTime() - startAt.getTime()
      setElapsed(elapsed)
    }, 1000)
    return () => clearInterval(interval)
  })

  const hours = Math.floor(elapsed / 1000 / 60 / 60)
  const minutes = Math.floor((elapsed / 1000 / 60) % 60)
  const seconds = Math.floor((elapsed / 1000) % 60)

  return (
    <div className="slashed-zero tabular-nums font-medium">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </div>
  )
}
