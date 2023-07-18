'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Popover } from '@radix-ui/react-popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'

type DatePickerWithRangeProps = React.InputHTMLAttributes<HTMLInputElement> & {
  from: Date
  to: Date
}

export function DatePickerWithRange({
  from,
  to,
  className
}: DatePickerWithRangeProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from,
    to
  })
  return (
    <div className={cn('grid gap-2', className)}>
      <input
        name="from"
        type="hidden"
        defaultValue={date?.from?.toISOString()}
      />
      <input name="to" type="hidden" defaultValue={date?.to?.toISOString()} />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} -{' '}
                  {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

// export const EditDate = ({ date: initial, bounds, ...rest }: EditDateProps) => {
//   const [date, setDate] = useState(initial)
//   const onSelect = (d: Date | undefined) => {
//     if (!d) return
//     d.setHours(bounds === 'start' ? 0 : 23)
//     d.setMinutes(bounds === 'start' ? 0 : 59)
//     d.setSeconds(bounds === 'start' ? 0 : 59)
//     setDate(d)
//   }

//   return (
//     <>
//       <input type="hidden" defaultValue={date.toISOString()} {...rest} />

//       <Popover>
//         <PopoverTrigger className="h-4 w-4">
//           <CalendarIcon size={16} />
//         </PopoverTrigger>
//         <PopoverContent>
//           <Calendar mode="single" selected={date} onSelect={onSelect} />
//         </PopoverContent>
//       </Popover>
//     </>
//   )
// }
