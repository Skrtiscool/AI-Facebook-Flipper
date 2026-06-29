import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

const DEAL_INCLUDE = {
  dealTags: { include: { tag: true } },
  activities: { orderBy: { createdAt: "desc" as const }, take: 50 },
  priceChanges: { orderBy: { createdAt: "desc" as const }, take: 10 },
}

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
      include: DEAL_INCLUDE,
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
    const { id, addTagId, removeTagId, ...data } = body
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    // Handle tag operations
    if (addTagId) {
      await prisma.dealTag.upsert({
        where: { dealId_tagId: { dealId: id, tagId: addTagId } },
        create: { dealId: id, tagId: addTagId },
        update: {},
      })
    }
    if (removeTagId) {
      await prisma.dealTag.deleteMany({
        where: { dealId: id, tagId: removeTagId },
      })
    }

    // Create activity for status change
    if (data.status) {
      const current = await prisma.deal.findUnique({ where: { id }, select: { status: true } })
      if (current && current.status !== data.status) {
        await prisma.dealActivity.create({
          data: {
            dealId: id,
            type: "status_change",
            message: `Status changed from ${current.status} to ${data.status}`,
            metadata: { from: current.status, to: data.status },
          },
        })
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    const scalarFields = [
      "read", "saved", "notes", "category", "status",
      "shippingCost", "fees", "actualProfit", "offerAmount",
      "sellerResponse", "expectedSalePrice", "storageLocation",
      "costBasis", "roi", "daysInInventory",
    ]
    for (const field of scalarFields) {
      if (data[field] !== undefined) updateData[field] = data[field]
    }
    if (data.offerDate !== undefined) updateData.offerDate = data.offerDate ? new Date(data.offerDate) : null
    if (data.dateBought !== undefined) updateData.dateBought = data.dateBought ? new Date(data.dateBought) : null
    if (data.dateSold !== undefined) updateData.dateSold = data.dateSold ? new Date(data.dateSold) : null

    const deal = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: DEAL_INCLUDE,
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
      await prisma.dealActivity.deleteMany({ where: { dealId: body.id } })
      await prisma.dealTag.deleteMany({ where: { dealId: body.id } })
      await prisma.deal.delete({ where: { id: body.id } })
    } else if (body.all) {
      const deals = await prisma.deal.findMany({ where: { userId: body.userId } })
      await prisma.priceChange.deleteMany({ where: { dealId: { in: deals.map(d => d.id) } } })
      await prisma.dealActivity.deleteMany({ where: { dealId: { in: deals.map(d => d.id) } } })
      await prisma.dealTag.deleteMany({ where: { dealId: { in: deals.map(d => d.id) } } })
      await prisma.deal.deleteMany({ where: { userId: body.userId } })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
