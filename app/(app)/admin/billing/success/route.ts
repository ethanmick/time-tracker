import { getUserSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const user = await getUserSession()
  const session_id = req.nextUrl.searchParams.get('session_id')
  if (!session_id) {
    redirect('/admin/billing')
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
  const customerId = checkoutSession.customer as string

  await prisma.tenant.update({
    where: { id: user.tenant.id },
    data: {
      stripeCustomerId: customerId,
      expirationDate: null,
      plan: 'PRO'
    }
  })

  redirect('/admin/billing')
}
