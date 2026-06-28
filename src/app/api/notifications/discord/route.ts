import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { testWebhook } from "@/services/notifications/discord"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const channel = await prisma.notificationChannel.findFirst({
    where: { userId: user.id, type: "discord" },
  })

  return NextResponse.json(channel)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const body = await request.json()
  const webhookUrl = body.webhookUrl

  if (!webhookUrl) {
    return NextResponse.json({ error: "Webhook URL required" }, { status: 400 })
  }

  const valid = await testWebhook(webhookUrl)
  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 })
  }

  const existing = await prisma.notificationChannel.findFirst({
    where: { userId: user.id, type: "discord" },
  })

  if (existing) {
    const updated = await prisma.notificationChannel.update({
      where: { id: existing.id },
      data: { config: JSON.stringify({ webhookUrl }) },
    })
    return NextResponse.json(updated)
  }

  const channel = await prisma.notificationChannel.create({
    data: {
      userId: user.id,
      type: "discord",
      config: JSON.stringify({ webhookUrl }),
    },
  })

  return NextResponse.json(channel, { status: 201 })
}
