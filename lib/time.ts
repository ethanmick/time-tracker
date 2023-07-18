export function getDuration(date1: Date, date2: Date) {
  const diff = Math.abs(date2.getTime() - date1.getTime())
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const minutesString =
    remainingMinutes < 10 ? '0' + remainingMinutes : remainingMinutes
  return hours + ':' + minutesString
}
