import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function PATCH(request: NextRequest) {
  try {
    await ensureUser()
    const body = await request.json()
    const { ids, ...data } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No deal IDs provided" }, { status: 400 })
    }

    // Create activity entries for batch status changes
    if (data.status) {
      const deals = await prisma.deal.findMany({ where: { id: { in: ids } } })
      await prisma.dealActivity.createMany({
        data: deals.map((d) => ({
          dealId: d.id,
          type: "status_change",
          message: `Status changed to ${data.status} (batch)`,
          metadata: { from: d.status, to: data.status, batch: true },
        })),
      })
    }

    const result = await prisma.deal.updateMany({
      where: { id: { in: ids } },
      data,
    })

    return NextResponse.json({ updated: result.count })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
