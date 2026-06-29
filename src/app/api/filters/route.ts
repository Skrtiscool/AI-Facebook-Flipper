import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function GET() {
  try {
    const user = await ensureUser()
    const filters = await prisma.savedFilter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(filters)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser()
    const body = await request.json()
    const filter = await prisma.savedFilter.create({
      data: {
        userId: user.id,
        name: body.name,
        filters: JSON.stringify(body.filters),
      },
    })
    return NextResponse.json(filter, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
