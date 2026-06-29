import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function GET() {
  try {
    const user = await ensureUser()
    const tags = await prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { dealTags: true } } },
    })
    return NextResponse.json(tags)
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser()
    const body = await request.json()
    const tag = await prisma.tag.create({
      data: {
        name: body.name,
        color: body.color || "#6366f1",
        userId: user.id,
      },
    })
    return NextResponse.json(tag, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
