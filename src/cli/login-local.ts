import { chromium } from "playwright"
import * as fs from "fs"
import * as path from "path"
import * as readline from "readline"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function main() {
  console.log("")
  console.log("=== Facebook Login Helper ===")
  console.log("A Chrome window will open. Log into Facebook normally.")
  console.log("Then come back here and press Enter.")
  console.log("")

  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  await page.goto("https://www.facebook.com", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  })

  // Auto-fill credentials if available
  const email = process.env.FB_EMAIL
  const pass = process.env.FB_PASSWORD
  if (email && pass) {
    const hasForm = await page.evaluate(() =>
      !!document.querySelector('input[name="email"], #email')
    ).catch(() => false)
    if (hasForm) {
      await page.fill('input[name="email"], #email', email).catch(() => {})
      await page.waitForTimeout(300)
      await page.fill('input[name="pass"], #pass', pass).catch(() => {})
      await page.waitForTimeout(300)
      await page.evaluate(() => {
        for (const b of document.querySelectorAll("button")) {
          if (b.textContent?.toLowerCase().includes("log in") || b.type === "submit") {
            ;(b as HTMLElement).click()
            break
          }
        }
      })
    }
  }

  await new Promise<void>((resolve) => {
    rl.question("Press Enter after logging into Facebook... ", () => resolve())
  })

  const cookies = await context.cookies()
  const ok = cookies.some((c: any) => c.name === "c_user" && c.value)

  if (!ok) {
    console.log("Not logged in yet. Waiting 30s...")
    await page.waitForTimeout(30000)
    const c2 = await context.cookies()
    const ok2 = c2.some((c: any) => c.name === "c_user" && c.value)
    if (!ok2) {
      console.log("Still not logged in. Run again.")
      process.exit(1)
    }
  }

  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
  console.log("Logged in! Cookies saved to .fb-cookies.json")
  console.log("Now run: npm run scan")

  await browser.close()
  rl.close()
  process.exit(0)
}

main().catch((e) => {
  console.error("Error:", e)
  rl.close()
  process.exit(1)
})
