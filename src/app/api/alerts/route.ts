import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const alerts = await prisma.alert.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(alerts)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await request.json()
  const alert = await prisma.alert.create({
    data: {
      userId: user.id,
      name: body.name,
      keywords: body.keywords || [],
      brands: body.brands || [],
      maxPrice: body.maxPrice ? parseFloat(body.maxPrice) : null,
      minProfit: body.minProfit ? parseFloat(body.minProfit) : null,
      minScore: body.minScore ? parseInt(body.minScore) : null,
      platforms: body.platforms || ["facebook"],
    },
  })

  return NextResponse.json(alert, { status: 201 })
}
