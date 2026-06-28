import { NextResponse } from "next/server"
import { ensureUser } from "@/lib/ensureUser"
import { startScheduler } from "@/services/scanner/scheduler"
import { runScan } from "@/services/scanner"

export async function POST() {
  try {
    await ensureUser()

    startScheduler(async () => {
      await runScan()
    })

    // Run first scan in background so we respond fast
    runScan().catch((err) => {
      console.error("[Scanner] Initial scan failed:", err)
    })

    return NextResponse.json({
      message: "Scanner started — initial scan running in background",
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unauthorized" },
      { status: 401 }
    )
  }
}
