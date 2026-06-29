import { chromium } from "playwright"
import * as fs from "fs"
import * as path from "path"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")

async function main() {
  // Check if cookies already exist and are valid
  if (fs.existsSync(COOKIE_PATH)) {
    const raw = fs.readFileSync(COOKIE_PATH, "utf-8")
    try {
      const cookies = JSON.parse(raw)
      const hasValid = cookies.some(
        (c: any) =>
          (c.name === "c_user" || c.name === "xs") &&
          c.value &&
          c.value.length > 0 &&
          (!c.expires || c.expires > Date.now() / 1000)
      )
      if (hasValid) {
        console.log("[Login] Valid cookies already exist — skipping login")
        process.exit(0)
      }
    } catch {}
  }

  const fbEmail = process.env.FB_EMAIL
  const fbPassword = process.env.FB_PASSWORD

  if (!fbEmail || !fbPassword) {
    console.log("[Login] No FB_EMAIL/FB_PASSWORD — cannot log in headlessly")
    console.log("[Login] Run 'npm run loginfb:local' on your PC to log in manually")
    process.exit(1)
  }

  console.log("[Login] Attempting headless Facebook login...")
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
  }

  for (let i = 0; i < 40; i++) {
    const cookies = await context.cookies()
    const hasSession = cookies.some((c: any) => c.name === "c_user" && c.value)

    if (hasSession) {
      fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
      console.log("[Login] Headless login successful! Cookies saved.")
      await browser.close()
      process.exit(0)
    }

    const url = page.url()
    if (url.includes("checkpoint") || url.includes("twofactor")) {
      console.log("[Login] Blocked by checkpoint/2FA — cannot log in headlessly.")
      break
    }

    await page.waitForTimeout(1500)
    console.log(`[Login] Waiting... (${i + 1}/40)`)
  }

  console.log("[Login] Headless login failed.")
  console.log("[Login] Run 'npm run loginfb:local' on your PC to log in manually once.")
  console.log("[Login] After that, GitHub Actions will reuse the saved cookies.")
  await browser.close()
  process.exit(1)
}

main().catch((err) => {
  console.error("[Login] Error:", err)
  process.exit(1)
})
