import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function GET() {
  try {
    const user = await ensureUser()

    const deals = await prisma.deal.findMany({ where: { userId: user.id } })

    const totalListed = deals.reduce((s, d) => s + d.price, 0)
    const totalEstimatedValue = deals.reduce((s, d) => s + d.estimatedValue, 0)
    const totalProfit = deals.reduce((s, d) => s + d.profit, 0)
    const totalActualProfit = deals.reduce((s, d) => s + (d.actualProfit ?? 0), 0)
    const totalShipping = deals.reduce((s, d) => s + (d.shippingCost ?? 0), 0)
    const totalFees = deals.reduce((s, d) => s + (d.fees ?? 0), 0)

    const bought = deals.filter((d) => d.status === "bought")
    const sold = deals.filter((d) => d.status === "sold")
    const totalSpent = bought.reduce((s, d) => s + d.price + (d.shippingCost ?? 0) + (d.fees ?? 0), 0)
    const totalEarned = sold.reduce((s, d) => s + (d.actualProfit ?? 0) + d.price + (d.shippingCost ?? 0) + (d.fees ?? 0), 0)

    // Monthly breakdown
    const monthly: Record<string, { spent: number; earned: number; count: number }> = {}
    for (const d of bought) {
      const key = d.dateBought
        ? new Date(d.dateBought).toISOString().slice(0, 7)
        : new Date(d.scannedAt).toISOString().slice(0, 7)
      if (!monthly[key]) monthly[key] = { spent: 0, earned: 0, count: 0 }
      monthly[key].spent += d.price + (d.shippingCost ?? 0) + (d.fees ?? 0)
      monthly[key].count++
    }
    for (const d of sold) {
      const key = d.dateSold
        ? new Date(d.dateSold).toISOString().slice(0, 7)
        : new Date(d.scannedAt).toISOString().slice(0, 7)
      if (!monthly[key]) monthly[key] = { spent: 0, earned: 0, count: 0 }
      monthly[key].earned += (d.actualProfit ?? d.profit) + d.price
    }

    return NextResponse.json({
      summary: {
        totalDeals: deals.length,
        totalListed,
        totalEstimatedValue,
        totalProfit,
        totalActualProfit,
        totalShipping,
        totalFees,
        totalSpent,
        totalEarned,
        roi: totalSpent > 0 ? ((totalEarned - totalSpent) / totalSpent * 100).toFixed(1) : "0",
        boughtCount: bought.length,
        soldCount: sold.length,
        watchingCount: deals.filter((d) => d.status === "watching").length,
      },
      monthly: Object.entries(monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({ month, ...data })),
    })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
