import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureUser()
    const { id } = await params
    const body = await request.json()

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.keywords !== undefined && { keywords: body.keywords }),
        ...(body.brands !== undefined && { brands: body.brands }),
        ...(body.maxPrice !== undefined && { maxPrice: body.maxPrice ? parseFloat(body.maxPrice) : null }),
        ...(body.minProfit !== undefined && { minProfit: body.minProfit ? parseFloat(body.minProfit) : null }),
        ...(body.minScore !== undefined && { minScore: body.minScore ? parseInt(body.minScore) : null }),
        ...(body.active !== undefined && { active: body.active }),
      },
    })

    return NextResponse.json(alert)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureUser()
    const { id } = await params
    await prisma.alert.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
