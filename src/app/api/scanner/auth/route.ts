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
      console.log("[Auth] Login form detected — auto-filling credentials...")

      const fbEmail = process.env.FB_EMAIL
      const fbPassword = process.env.FB_PASSWORD

      if (fbEmail && fbPassword) {
        // Auto-fill and submit
        await page.fill('input[name="email"], #email', fbEmail)
        await page.fill('input[name="pass"], #pass', fbPassword)
        await page.waitForTimeout(500)
        // Try clicking the login button with common selectors
        const loginBtn = await page.waitForSelector(
          'button[type="submit"], button:has-text("Log In"), button:has-text("Log in"), #loginbutton',
          { timeout: 5000 }
        ).catch(() => null)
        if (loginBtn) {
          await loginBtn.click()
        } else {
          await page.keyboard.press("Enter")
        }

        // Wait for login form to disappear (login completed)
        await page.waitForFunction(
          () => {
            const email = document.querySelector('input[name="email"], #email')
            const pass = document.querySelector('input[name="pass"], #pass')
            return !email && !pass
          },
          { timeout: 60000 }
        )
        console.log("[Auth] Auto-login successful!")

        // Handle post-login dialogs (Continue as, Save device, etc.)
        await page.waitForTimeout(3000)
        const buttons = await page.$$('button, div[role="button"], a[role="button"]')
        for (const btn of buttons) {
          const text = await btn.textContent()
          if (
            text?.toLowerCase().includes("continue") ||
            text?.toLowerCase().includes("not now") ||
            text?.toLowerCase().includes("save") ||
            text?.toLowerCase().includes("close")
          ) {
            await btn.click().catch(() => {})
            await page.waitForTimeout(1000)
            break
          }
        }
      } else {
        console.log("[Auth] No credentials set — waiting for manual login...")
        await page.waitForFunction(
          () => {
            const email = document.querySelector('input[name="email"], #email')
            const pass = document.querySelector('input[name="pass"], #pass')
            return !email && !pass
          },
          { timeout: 300000 }
        )
        console.log("[Auth] Manual login detected!")
      }
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
