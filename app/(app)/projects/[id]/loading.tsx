import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex justify-center w-full">
      <Loader2 size={32} className="animate-spin" />
    </div>
  )
}
