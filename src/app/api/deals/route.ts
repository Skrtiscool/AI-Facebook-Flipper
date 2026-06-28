import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

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
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const deal = await prisma.deal.update({
    where: { id: body.id },
    data: {
      ...(body.read !== undefined && { read: body.read }),
      ...(body.saved !== undefined && { saved: body.saved }),
    },
  })

  return NextResponse.json(deal)
}
