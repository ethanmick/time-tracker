'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { pad } from '@/lib/utils'
import { Activity } from '@prisma/client'
import { ArrowRight, CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { deleteActivity, updateActivity } from './actions'

type Props = {
  activity: Activity
}

type EditDateTimeProps = {
  name?: string
  value: Date
  onChange?: (date: Date) => void
}

const EditDateTime = ({ name, value, onChange }: EditDateTimeProps) => {
  const [date, setDate] = useState(value)

  const onDate = (d: Date | undefined) => {
    if (!d) return

    d.setHours(date.getHours())
    d.setMinutes(date.getMinutes())
    d.setSeconds(date.getSeconds())
    setDate(d)
    onChange && onChange(d)
  }

  return (
    <div>
      <div className="relative flex items-center">
        <input type="hidden" name={name} defaultValue={date.toISOString()} />
        <Input
          type="time"
          className="pr-8"
          value={`${pad(date.getHours())}:${pad(date.getMinutes())}`}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(':')
            const newDate = new Date(date)
            newDate.setHours(parseInt(hours) || 0)
            newDate.setMinutes(parseInt(minutes) || 0)
            setDate(newDate)
            onChange && onChange(newDate)
          }}
        />
        <Popover>
          <PopoverTrigger className="absolute right-2 h-4 w-4">
            <CalendarIcon size={16} />
          </PopoverTrigger>
          <PopoverContent>
            <Calendar mode="single" selected={date} onSelect={onDate} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}

type EditItemRowProps = Props & {
  onSave: () => void
}

const EditItemRow = ({ activity, onSave }: EditItemRowProps) => {
  return (
    <li className="py-2">
      <form
        action={async (data) => {
          await updateActivity(data)
          onSave()
        }}
        className="flex items-center space-x-2"
      >
        <input type="hidden" name="id" defaultValue={activity.id} />
        <Input
          className="w-[300px]"
          type="text"
          name="name"
          defaultValue={activity.name || ''}
        />
        <EditDateTime name="startAt" value={activity.startAt} />
        <EditDateTime name="endAt" value={activity.endAt || new Date()} />
        <span className="flex-grow" />
        <Button type="submit">Save</Button>
      </form>
    </li>
  )
}

type ReadItemRowProps = Props & {
  edit: () => void
  onDelete: (id: string) => void
}

const ReadItemRow = ({ activity, onDelete, edit }: ReadItemRowProps) => {
  return (
    <li className="py-2 space-x-2 flex items-center">
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
      <span className="flex-grow" />
      <Button onClick={edit}>Edit</Button>
      <Button
        className="ml-2"
        variant="destructive"
        onClick={async () => onDelete(activity.id)}
      >
        Delete
      </Button>
    </li>
  )
}

export const ActivityItemRow = ({ activity }: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  return isEditing ? (
    <EditItemRow activity={activity} onSave={() => setIsEditing(false)} />
  ) : (
    <ReadItemRow
      activity={activity}
      edit={() => setIsEditing(true)}
      onDelete={deleteActivity}
    />
  )
}
