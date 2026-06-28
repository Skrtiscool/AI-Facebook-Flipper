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
      channel: "chrome",
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    })

    const page = await context.newPage()

    // Go to marketplace — if you're logged in Chrome, you'll see it directly
    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    })

    // Wait for page to settle
    await page.waitForTimeout(5000)

    // Try up to 2 minutes to get logged in (manual or auto)
    for (let i = 0; i < 40; i++) {
      const cookies = await context.cookies()
      const hasSession = cookies.some((c: any) => c.name === "c_user" && c.value)
      if (hasSession) {
        await saveCookies(context)
        await browser.close()
        return NextResponse.json({ message: "Facebook connected successfully" })
      }

      const url = page.url()
      const hasLoginForm = await page.evaluate(() =>
        !!document.querySelector('input[name="email"], #email, input[name="pass"], #pass')
      ).catch(() => false)

      // Auto-fill if login form is visible and we have credentials
      if (hasLoginForm) {
        const fbEmail = process.env.FB_EMAIL
        const fbPassword = process.env.FB_PASSWORD
        if (fbEmail && fbPassword) {
          await page.fill('input[name="email"], #email', fbEmail, { timeout: 2000 }).catch(() => {})
          await page.fill('input[name="pass"], #pass', fbPassword, { timeout: 2000 }).catch(() => {})
          await page.waitForTimeout(500)
          await page.evaluate(() => {
            const btns = document.querySelectorAll("button")
            for (const b of btns) {
              if (b.textContent?.toLowerCase().includes("log in") || b.type === "submit") {
                ;(b as HTMLElement).click()
                break
              }
            }
          })
          console.log("[Auth] Auto-filled and submitted login")
        }
      }

      await page.waitForTimeout(3000)
      console.log(`[Auth] Waiting for login... (${i + 1}/40)`)
    }

    await browser.close()
    return NextResponse.json(
      { error: "Facebook login timed out" },
      { status: 500 }
    )
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
