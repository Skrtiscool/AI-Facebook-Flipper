import { chromium } from "playwright"
import * as fs from "fs"
import * as path from "path"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")

async function main() {
  const fbEmail = process.env.FB_EMAIL
  const fbPassword = process.env.FB_PASSWORD

  if (!fbEmail || !fbPassword) {
    console.error("[Login] FB_EMAIL and FB_PASSWORD must be set")
    process.exit(1)
  }

  console.log("[Login] Launching headless Chromium...")
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  })

  const page = await context.newPage()

  console.log("[Login] Going to Facebook...")
  await page.goto("https://www.facebook.com", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })

  await page.waitForTimeout(3000)

  const hasLoginForm = await page.evaluate(() =>
    !!document.querySelector('input[name="email"], #email, input[name="pass"], #pass')
  ).catch(() => false)

  if (hasLoginForm) {
    console.log("[Login] Filling credentials...")
    await page.fill('input[name="email"], #email', fbEmail, { timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(500)
    await page.fill('input[name="pass"], #pass', fbPassword, { timeout: 5000 }).catch(() => {})
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

    console.log("[Login] Submitted login form...")
  }

  // Wait for login to complete (up to 60s)
  for (let i = 0; i < 40; i++) {
    const cookies = await context.cookies()
    const hasSession = cookies.some((c: any) => c.name === "c_user" && c.value)

    if (hasSession) {
      fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
      console.log("[Login] Successfully logged in and cookies saved!")
      await browser.close()
      process.exit(0)
    }

    // Check for 2FA or checkpoint
    const url = page.url()
    if (url.includes("checkpoint") || url.includes("twofactor")) {
      console.log("[Login] Login blocked by checkpoint/2FA. Cannot automate.")
      console.log("[Login] Please run 'npm run loginfb:local' on your PC instead.")
      await browser.close()
      process.exit(1)
    }

    await page.waitForTimeout(1500)
    console.log(`[Login] Waiting for login... (${i + 1}/40)`)
  }

  console.log("[Login] Login timed out")
  await browser.close()
  process.exit(1)
}

main().catch((err) => {
  console.error("[Login] Fatal error:", err)
  process.exit(1)
})
