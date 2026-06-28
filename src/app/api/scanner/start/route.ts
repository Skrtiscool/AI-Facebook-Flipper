import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { startScheduler } from "@/services/scanner/scheduler"
import { runScan } from "@/services/scanner"

export async function POST() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  startScheduler(async () => {
    await runScan()
  })

  // Run an immediate first scan
  const result = await runScan()

  return NextResponse.json({
    message: "Scanner started",
    scan: result,
  })
}
