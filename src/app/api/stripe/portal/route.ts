import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { ensureUser } from "@/lib/ensureUser"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await ensureUser()
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id } })
    const customerId = sub?.stripeCustomerId || user.stripeCustomerId

    if (!customerId) {
      return NextResponse.json({ error: "No Stripe customer" }, { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
