import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function GET() {
  try {
    const user = await ensureUser()
    const alerts = await prisma.alert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(alerts)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser()

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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
