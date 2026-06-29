import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser()
    const body = await request.json()

    const deal = await prisma.deal.create({
      data: {
        userId: user.id,
        title: body.title,
        price: parseFloat(body.price),
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : parseFloat(body.price) * 1.5,
        profit: body.profit ? parseFloat(body.profit) : 0,
        score: body.score ? parseInt(body.score) : 50,
        recommendation: body.recommendation || "buy",
        platform: body.platform || "manual",
        listingUrl: body.listingUrl || null,
        imageUrls: body.imageUrls || [],
        location: body.location || null,
        condition: body.condition || null,
        category: body.category || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
