import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function GET(request: NextRequest) {
  try {
    const user = await ensureUser()

    const { searchParams } = new URL(request.url)
    const read = searchParams.get("read")
    const saved = searchParams.get("saved")

    const where: Record<string, unknown> = { userId: user.id }
    if (read === "true") where.read = true
    if (read === "false") where.read = false
    if (saved === "true") where.saved = true

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { scannedAt: "desc" },
      take: 50,
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
    const deal = await prisma.deal.update({
      where: { id: body.id },
      data: {
        ...(body.read !== undefined && { read: body.read }),
        ...(body.saved !== undefined && { saved: body.saved }),
      },
    })
    return NextResponse.json(deal)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
