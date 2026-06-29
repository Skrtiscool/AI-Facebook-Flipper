import { NextResponse } from "next/server"
import { ensureUser } from "@/lib/ensureUser"
import { prisma } from "@/lib/prisma"
import { PLANS, PlanId } from "@/lib/stripe"

export async function GET() {
  try {
    const user = await ensureUser()
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id } })

    const planId: PlanId = (sub?.plan as PlanId) || "free"
    const plan = PLANS[planId]

    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const scansUsed = await prisma.scannerRun.count({
      where: {
        userId: user.id,
        startedAt: { gte: monthStart },
        status: "completed",
      },
    })

    return NextResponse.json({
      plan: planId,
      planName: plan.name,
      status: sub?.status || "active",
      scansUsed,
      scanLimit: plan.scansPerMonth,
      currentPeriodEnd: sub?.currentPeriod,
      cancelAtPeriodEnd: sub?.cancelAtPeriodEnd || false,
      features: plan.features,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
