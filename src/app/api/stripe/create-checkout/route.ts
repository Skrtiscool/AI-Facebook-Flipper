import { NextRequest, NextResponse } from "next/server"
import { stripe, PLANS } from "@/lib/stripe"
import { ensureUser } from "@/lib/ensureUser"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser()
    const body = await request.json()
    const planId = body.plan as keyof typeof PLANS

    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const plan = PLANS[planId]

    if (planId === "free") {
      const existing = await prisma.subscription.findUnique({ where: { userId: user.id } })
      if (existing?.stripeId) {
        await stripe.subscriptions.cancel(existing.stripeId).catch(() => {})
      }
      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: { plan: "free", status: "active", stripeId: null, currentPeriod: null, cancelAtPeriodEnd: false },
        create: { userId: user.id, plan: "free", status: "active" },
      })
      return NextResponse.json({ url: "/dashboard" })
    }

    let customerId: string
    const existingSub = await prisma.subscription.findUnique({ where: { userId: user.id } })
    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{
        price_data: {
          currency: "usd",
          product: plan.productId,
          recurring: { interval: "month" },
          unit_amount: Math.round(plan.price * 100),
        },
        quantity: 1,
      }],
      success_url: `${baseUrl}/account?checkout=success`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { userId: user.id, plan: planId },
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
