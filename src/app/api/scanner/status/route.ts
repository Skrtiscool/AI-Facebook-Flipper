import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { isSchedulerRunning } from "@/services/scanner/scheduler"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const lastRun = await prisma.scannerRun.findFirst({
    orderBy: { startedAt: "desc" },
  })

  const totalDeals = await prisma.deal.count({
    where: { userId: user.id },
  })

  const alertsCount = await prisma.alert.count({
    where: { userId: user.id, active: true },
  })

  return NextResponse.json({
    running: isSchedulerRunning(),
    lastRun: lastRun || null,
    totalDeals,
    activeAlerts: alertsCount,
  })
}
