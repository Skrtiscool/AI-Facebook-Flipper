import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"
import { isSchedulerRunning } from "@/services/scanner/scheduler"
import { hasSavedSession } from "@/services/scanner/auth"

export async function GET() {
  try {
    const user = await ensureUser()

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
      facebookConnected: hasSavedSession(),
      lastRun: lastRun || null,
      totalDeals,
      activeAlerts: alertsCount,
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
