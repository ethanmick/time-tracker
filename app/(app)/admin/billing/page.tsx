import { getUserSession } from '@/lib/auth'

export default async function BillingPage() {
  const user = await getUserSession()

  return (
    <div>
      <h1 className="text-3xl mb-4">Billing</h1>
      <div className="flex">
        <>Content</>
      </div>
    </div>
  )
}
