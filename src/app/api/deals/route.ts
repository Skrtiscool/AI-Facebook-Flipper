import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser()
    const { searchParams } = new URL(request.url)
    const read = searchParams.get("read")
    const saved = searchParams.get("saved")
    const status = searchParams.get("status")
    const category = searchParams.get("category")

    const where: Record<string, unknown> = { userId: user.id }
    if (read === "true") where.read = true
    if (read === "false") where.read = false
    if (saved === "true") where.saved = true
    if (status) where.status = status
    if (category) where.category = category

    const deals = await prisma.deal.findMany({
      where,
      orderBy: [{ saved: "desc" }, { scannedAt: "desc" }],
      take: 100,
    })

    return NextResponse.json(deals)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureUser()
    const body = await request.json()
    const { id, ...data } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...(data.read !== undefined && { read: data.read }),
        ...(data.saved !== undefined && { saved: data.saved }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.shippingCost !== undefined && { shippingCost: data.shippingCost }),
        ...(data.fees !== undefined && { fees: data.fees }),
        ...(data.actualProfit !== undefined && { actualProfit: data.actualProfit }),
      },
    })

    return NextResponse.json(deal)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Update failed" }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await ensureUser()
    const body = await request.json()
    if (body.id) {
      await prisma.priceChange.deleteMany({ where: { dealId: body.id } })
      await prisma.deal.delete({ where: { id: body.id } })
    } else if (body.all) {
      const deals = await prisma.deal.findMany({ where: { userId: body.userId } })
      await prisma.priceChange.deleteMany({ where: { dealId: { in: deals.map(d => d.id) } } })
      await prisma.deal.deleteMany({ where: { userId: body.userId } })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
