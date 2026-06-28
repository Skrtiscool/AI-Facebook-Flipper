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

    // Go directly to marketplace — if not logged in, Facebook redirects to login
    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })

    // Check if we're on the login page or see a login form
    const currentUrl = page.url()
    const hasLoginForm = await page.evaluate(() => {
      return !!document.querySelector('input[name="email"], #email, input[name="pass"], #pass')
    })

    if (currentUrl.includes("login") || hasLoginForm) {
      const fbEmail = process.env.FB_EMAIL
      const fbPassword = process.env.FB_PASSWORD

      if (fbEmail && fbPassword && hasLoginForm) {
        // Auto-fill credentials
        console.log("[Auth] Auto-filling credentials...")
        await page.fill('input[name="email"], #email', fbEmail, { timeout: 5000 }).catch(() => {})
        await page.fill('input[name="pass"], #pass', fbPassword, { timeout: 5000 }).catch(() => {})
        await page.waitForTimeout(1000)

        // Click any button that says "Log In" or submit-type button
        await page.evaluate(() => {
          const buttons = document.querySelectorAll('button')
          for (const btn of buttons) {
            if (btn.textContent?.toLowerCase().includes('log in') || btn.type === 'submit') {
              btn.click()
              return
            }
          }
        })
        console.log("[Auth] Login button clicked")

        // Wait for URL to change away from login
        await page.waitForFunction(
          () => !window.location.href.includes("login") &&
                 !document.querySelector('input[name="email"], #email, input[name="pass"], #pass'),
          { timeout: 60000 }
        )
        console.log("[Auth] Login detected!")
      } else {
        // Manual login — wait for URL to change away from login
        console.log("[Auth] Waiting for manual login...")
        await page.waitForFunction(
          () => !window.location.href.includes("login"),
          { timeout: 300000 }
        )
      }
    }

    // Now on logged-in homepage — navigate to marketplace to trigger full session
    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })
    await page.waitForTimeout(3000)

    // Verify we actually have session cookies before saving
    const cookies = await context.cookies()
    const hasSession = cookies.some((c: any) => c.name === "c_user" && c.value)
    if (!hasSession) {
      console.log("[Auth] No c_user cookie found — login may have failed")
      await browser.close()
      return NextResponse.json(
        { error: "Facebook login failed — no session cookie created" },
        { status: 500 }
      )
    }

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
