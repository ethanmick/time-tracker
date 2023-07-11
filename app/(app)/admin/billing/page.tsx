import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { AlertCircle, Check } from 'lucide-react'
import { redirect } from 'next/navigation'

const vercel_url = process.env.NEXT_PUBLIC_VERCEL_URL
const DOMAIN = vercel_url ? `https://${vercel_url}` : 'http://localhost:3000'

const PlanRow = ({ children }: React.PropsWithChildren) => (
  <li className="flex items-center">
    <Check size={16} className="stroke-blue-500 mr-2" /> {children}
  </li>
)

const free = ['1 user', '1 client', '1 project', 'No teams', 'No tags']

const FreePlan = () => (
  <div className="p-4 shadow border-1 rounded-lg bg-blue-100 space-y-4">
    <h2 className="text-center text-xl">Current Plan: Free</h2>
    <p className="">
      The basic plan to get you started. Great for seeing if Time Tracker is
      right for you and to run small projects.
    </p>
    <ul className="text-lg">
      {free.map((item, index) => (
        <PlanRow key={index}>{item}</PlanRow>
      ))}
    </ul>
  </div>
)

const pro = [
  'Unlimited user',
  'Unlimited client',
  'Unlimited project',
  'Unlimited teams',
  'Unlimited tags'
]

const Upgrade = () => {
  async function createCheckoutSession(data: FormData) {
    'use server'
    const user = await getUserSession()

    const lookup = data.get('lookup_key') as string
    const prices = await stripe.prices.list({
      lookup_keys: [lookup],
      expand: ['data.product']
    })

    const session = await stripe.checkout.sessions.create({
      billing_address_collection: 'auto',
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1
        }
      ],
      subscription_data: {
        metadata: {
          tenantId: user.tenant.id
        }
      },
      mode: 'subscription',
      success_url: `${DOMAIN}/admin/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/admin/billing?canceled=true`
    })

    redirect(session.url || '')
  }

  return (
    <div className="p-4 shadow border-1 rounded-lg bg-blue-800 space-y-4 text-neutral-50">
      <h2 className="text-2xl font-medium text-center">Upgrade to Pro</h2>
      <p>The Pro plan has no limits and unlocks all functionality.</p>
      <ul>
        {pro.map((item, index) => (
          <PlanRow key={index}>{item}</PlanRow>
        ))}
      </ul>
      <div className="flex items-center justify-around">
        <form action={createCheckoutSession}>
          <input type="hidden" name="lookup_key" value="pro-monthly" />
          <Button type="submit">Monthly: $1/mo</Button>
        </form>
        <form action={createCheckoutSession}>
          <input type="hidden" name="lookup_key" value="pro-yearly" />
          <Button type="submit">Yearly: $10/yr</Button>
        </form>
      </div>
    </div>
  )
}

const ProPlan = () => {
  async function createPortalSession() {
    'use server'

    const user = await getUserSession()
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenant.id }
    })
    if (!tenant) throw new Error('No tenant found')
    if (!tenant.stripeCustomerId) throw new Error('No stripe customer id')

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${DOMAIN}/admin/billing`
    })
    redirect(portalSession.url)
  }
  return (
    <div className="p-4 shadow border-1 rounded-lg bg-blue-800 space-y-4 text-neutral-50">
      <h2 className="text-xl text-center">Current Plan: Pro</h2>
      <p>The Pro plan has no limits and unlocks all functionality.</p>
      <ul>
        {pro.map((item, index) => (
          <PlanRow key={index}>{item}</PlanRow>
        ))}
      </ul>
      <div className="flex items-center justify-around">
        <form action={createPortalSession}>
          <Button type="submit">Manage Subscription</Button>
        </form>
      </div>
    </div>
  )
}

export default async function BillingPage() {
  const user = await getUserSession()
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenant.id }
  })

  return (
    <div className="space-y-12">
      <h1 className="text-3xl mb-4">Billing</h1>
      {tenant?.expirationDate && tenant.plan === 'PRO' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Expiring</AlertTitle>
          <AlertDescription>
            Your subscription will expire on{' '}
            {tenant.expirationDate.toLocaleDateString()}. Please update your
            subscription to continue using Time Tracker.
          </AlertDescription>
        </Alert>
      )}
      {tenant?.plan === 'FREE' ? (
        <div className="grid grid-cols-2 items-start justify-center gap-8">
          <FreePlan />
          <Upgrade />
        </div>
      ) : (
        <div className="flex justify-center">
          <ProPlan />
        </div>
      )}
    </div>
  )
}
