import { chromium } from "playwright"
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function main() {
  console.log("[Login] Opening Chrome for Facebook login...")
  console.log("[Login] A browser window will open. Log into Facebook, then press Enter here.")

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })

  const page = await context.newPage()
  await page.goto("https://www.facebook.com/marketplace", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })

  // Try auto-fill with credentials if available
  const fbEmail = process.env.FB_EMAIL
  const fbPassword = process.env.FB_PASSWORD
  if (fbEmail && fbPassword) {
    const hasLoginForm = await page.evaluate(() =>
      !!document.querySelector('input[name="email"], #email, input[name="pass"], #pass')
    ).catch(() => false)
    if (hasLoginForm) {
      console.log("[Login] Auto-filling credentials...")
      await page.fill('input[name="email"], #email', fbEmail, { timeout: 2000 }).catch(() => {})
      await page.waitForTimeout(500)
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
    }
  }

  await new Promise<void>((resolve) => {
    rl.question("Press Enter after you've logged into Facebook... ", () => {
      resolve()
    })
  })

  // Check if we're logged in
  const cookies = await context.cookies()
  const hasSession = cookies.some((c: any) => c.name === "c_user" && c.value)

  if (!hasSession) {
    console.log("[Login] No Facebook session detected. Waiting 30 more seconds...")
    await page.waitForTimeout(30000)
    const cookies2 = await context.cookies()
    const hasSession2 = cookies2.some((c: any) => c.name === "c_user" && c.value)
    if (!hasSession2) {
      console.log("[Login] Still not logged in. Try again.")
      await browser.close()
      process.exit(1)
    }
  }

  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
  console.log("[Login] Facebook login successful! Cookies saved to .fb-cookies.json")

  await browser.close()
  rl.close()
  process.exit(0)
}

main().catch((err) => {
  console.error("[Login] Error:", err)
  rl.close()
  process.exit(1)
})
