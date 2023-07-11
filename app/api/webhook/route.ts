import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(req: NextRequest) {
  console.log('webhook received')

  let event: Stripe.Event | undefined
  try {
    const signature = req.headers.get('stripe-signature') || ''
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      ENDPOINT_SECRET
    )
  } catch (err: any) {
    console.log(`⚠️ Webhook signature verification failed.`, err.message)
    return new NextResponse(JSON.stringify({ error: 'invalid payload' }), {
      status: 400
    })
  }

  console.log('Event', event)

  switch (event.type) {
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription
      await prisma.tenant.update({
        where: {
          id: subscription.metadata.tenantId
        },
        data: {
          expirationDate: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null
        }
      })
  }

  return NextResponse.json({ received: true })
}
