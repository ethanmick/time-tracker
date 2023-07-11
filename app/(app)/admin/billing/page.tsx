import { Button } from '@/components/ui/button'
import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'

const vercel_url = process.env.NEXT_PUBLIC_VERCEL_URL
const DOMAIN = vercel_url ? `https://${vercel_url}` : 'http://localhost:3000'

export default async function BillingPage() {
  const user = await getUserSession()

  async function createCheckoutSession(data: FormData) {
    'use server'

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
    <div className="space-y-12">
      <h1 className="text-3xl mb-4">Billing</h1>
      <div className="flex items-end gap-8">
        <div>
          <h2 className="font-semibold mb-2">Current Plan</h2>
          <p>
            The plan you are currently subscribed too. You can upgrade or
            downgrade at any time. The pro subscription is a demo.
          </p>
          <p>Pro is $10 a year or $1 a month.</p>
        </div>
        <div className="min-w-[200px]">
          <form action={createCheckoutSession}>
            <input type="hidden" name="lookup_key" value="pro-monthly" />
            <Button type="submit">Upgrade to Pro Month</Button>
          </form>
          <form action={createCheckoutSession}>
            <input type="hidden" name="lookup_key" value="pro-yearly" />
            <Button type="submit">Upgrade to Pro Year</Button>
          </form>
        </div>
      </div>
      <div className="flex items-end gap-8">
        <div className="flex-grow">
          <h2 className="font-semibold mb-2">Manage Plan</h2>
          <p>You can manage your plan here.</p>
        </div>
        <div className="min-w-[200px]">
          <form action={createPortalSession}>
            <Button type="submit">Update Billing</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
