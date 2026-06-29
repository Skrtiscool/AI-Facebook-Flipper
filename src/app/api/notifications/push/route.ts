import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUser } from "@/lib/ensureUser"

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUser()
    const body = await request.json()

    await prisma.notificationChannel.upsert({
      where: {
        id: body.id || "push-" + user.id,
      },
      update: {
        config: JSON.stringify(body.subscription),
        enabled: true,
      },
      create: {
        id: "push-" + user.id,
        userId: user.id,
        type: "push",
        config: JSON.stringify(body.subscription),
        enabled: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function DELETE() {
  try {
    const user = await ensureUser()
    await prisma.notificationChannel.deleteMany({
      where: { userId: user.id, type: "push" },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
