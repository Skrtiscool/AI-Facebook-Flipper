import { NextResponse } from "next/server"
import { chromium } from "playwright"
import { saveCookies, hasSavedSession, clearSession } from "@/services/scanner/auth"
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

    clearSession()

    const browser = await chromium.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    })

    const page = await context.newPage()

    // Go to facebook.com first — login page might show
    await page.goto("https://www.facebook.com", {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    // Check if we're on a login page
    const onLoginPage = page.url().includes("login")

    if (onLoginPage) {
      // Wait for user to log in — URL will stop containing "login"
      console.log("[Auth] Waiting for Facebook login...")
      await page.waitForFunction(
        () => !window.location.href.includes("login"),
        { timeout: 300000 }
      )
      console.log("[Auth] Login detected!")
    }

    // Now navigate to marketplace
    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    await page.waitForTimeout(2000)
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
    clearSession()
    return NextResponse.json({ message: "Facebook session cleared" })
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
