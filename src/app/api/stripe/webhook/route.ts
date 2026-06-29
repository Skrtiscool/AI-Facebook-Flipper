import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  const sig = request.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

  const body = await request.text()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret || "")
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan || "pro"
        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan,
              status: "active",
              stripeId: session.subscription,
              stripeCustomerId: session.customer,
              currentPeriod: new Date(session.expires_at * 1000),
              cancelAtPeriodEnd: false,
            },
            create: {
              userId,
              plan,
              status: "active",
              stripeId: session.subscription,
              stripeCustomerId: session.customer,
              currentPeriod: new Date(session.expires_at * 1000),
            },
          })
          await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: session.customer } })
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId) as any
          const userId = sub.metadata?.userId || (await findUserBySubscription(subscriptionId))
          if (userId) {
            await prisma.subscription.update({
              where: { userId },
              data: {
                status: "active",
                currentPeriod: new Date((sub.current_period_end || sub.currentPeriodEnd) * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancelAtPeriodEnd,
              },
            })
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as any
        const userId = sub.metadata?.userId || (await findUserBySubscription(sub.id))
        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              status: sub.status,
              currentPeriod: new Date((sub.current_period_end || sub.currentPeriodEnd) * 1000),
              cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancelAtPeriodEnd,
            },
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const deletedSub = event.data.object as any
        const userId = deletedSub.metadata?.userId || (await findUserBySubscription(deletedSub.id || deletedSub.stripeId))
        if (userId) {
          await prisma.subscription.upsert({
            where: { userId },
            update: { plan: "free", status: "canceled", stripeId: null },
            create: { userId, plan: "free", status: "canceled" },
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (e: any) {
    console.error("[Stripe Webhook]", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

async function findUserBySubscription(stripeSubId: string): Promise<string | null> {
  const sub = await prisma.subscription.findFirst({ where: { stripeId: stripeSubId } })
  return sub?.userId || null
}
