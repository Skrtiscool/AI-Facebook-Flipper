import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stopScheduler } from "@/services/scanner/scheduler"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  stopScheduler()

  return NextResponse.json({ message: "Scanner stopped" })
}
