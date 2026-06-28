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

    // Go to Facebook — user will see login or feed
    await page.goto("https://www.facebook.com", {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    // Check if we see a login form (email/password fields)
    const needsLogin = await page.evaluate(() => {
      return !!(
        document.querySelector('input[name="email"]') ||
        document.querySelector('input[name="pass"]') ||
        document.querySelector("#email") ||
        document.querySelector("#pass")
      )
    })

    if (needsLogin) {
      console.log("[Auth] Login form detected — waiting for user to log in...")
      // Wait for login form to disappear (user submitted credentials)
      await page.waitForFunction(
        () => {
          const email = document.querySelector('input[name="email"], #email')
          const pass = document.querySelector('input[name="pass"], #pass')
          return !email && !pass
        },
        { timeout: 300000 }
      )
      console.log("[Auth] Login detected!")
    }

    // Wait a moment for post-login redirects, then go to marketplace
    await page.waitForTimeout(3000)
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
