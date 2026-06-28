import { NextResponse } from "next/server"
import { ensureUser } from "@/lib/ensureUser"
import { stopScheduler } from "@/services/scanner/scheduler"

export async function POST() {
  try {
    await ensureUser()
    stopScheduler()
    return NextResponse.json({ message: "Scanner stopped" })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
