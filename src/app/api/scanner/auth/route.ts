import { NextResponse } from "next/server"
import { chromium } from "playwright"
import { saveCookies, hasSavedSession } from "@/services/scanner/auth"
import { ensureUser } from "@/lib/ensureUser"

export async function GET() {
  try {
    await ensureUser()
    return NextResponse.json({ connected: hasSavedSession() })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST() {
  try {
    await ensureUser()

    if (hasSavedSession()) {
      return NextResponse.json({ message: "Already connected to Facebook" })
    }

    const browser = await chromium.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    })

    const page = await context.newPage()
    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "domcontentloaded",
    })

    // Wait for user to log in — detect by URL leaving login page
    await page.waitForURL("**/marketplace/**", { timeout: 0 })
    await saveCookies(context)

    await browser.close()

    return NextResponse.json({ message: "Facebook connected successfully" })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Facebook auth failed" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await ensureUser()
    const { clearSession } = await import("@/services/scanner/auth")
    clearSession()
    return NextResponse.json({ message: "Facebook session cleared" })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
