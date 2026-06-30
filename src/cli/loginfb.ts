import { chromium } from "playwright"
import * as fs from "fs"
import * as path from "path"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function humanDelay(page: any, min = 200, max = 600) {
  await page.waitForTimeout(randomBetween(min, max))
}

async function moveMouse(page: any, selector: string) {
  try {
    const el = await page.$(selector)
    if (el) {
      const box = await el.boundingBox()
      if (box) {
        const x = box.x + box.width * (0.3 + Math.random() * 0.4)
        const y = box.y + box.height * (0.3 + Math.random() * 0.4)
        await page.mouse.move(x, y, { steps: randomBetween(5, 15) })
      }
    }
  } catch {}
}

async function main() {
  // Check existing cookies first
  if (fs.existsSync(COOKIE_PATH)) {
    try {
      const raw = fs.readFileSync(COOKIE_PATH, "utf-8")
      const cookies = JSON.parse(raw)
      const hasValid = cookies.some(
        (c: any) =>
          (c.name === "c_user" || c.name === "xs") &&
          c.value &&
          c.value.length > 0 &&
          (!c.expires || c.expires > Date.now() / 1000)
      )
      if (hasValid) {
        console.log("[Login] Valid cookies found — skipping login")
        process.exit(0)
      }
    } catch {}
  }

  const fbEmail = process.env.FB_EMAIL
  const fbPassword = process.env.FB_PASSWORD

  if (!fbEmail || !fbPassword) {
    console.log("[Login] FB_EMAIL and FB_PASSWORD not set")
    process.exit(1)
  }

  console.log("[Login] Launching Chrome with stealth...")

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-web-security",
      "--disable-features=BlockInsecurePrivateNetworkRequests",
    ],
  })

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    locale: "en-US",
    timezoneId: "America/New_York",
    geolocation: { latitude: 40.7128, longitude: -74.006 },
    permissions: ["geolocation"],
    colorScheme: "light",
    deviceScaleFactor: 1,
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  })

  // Override webdriver property
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false })
    // Override chrome runtime
    // @ts-ignore
    window.chrome = { runtime: {} }
    // Override permissions
    const originalQuery = window.navigator.permissions.query
    window.navigator.permissions.query = (params: any) =>
      params.name === "notifications"
        ? Promise.resolve({ state: "denied" })
        : originalQuery(params)
  })

  const page = await context.newPage()

  console.log("[Login] Navigating to Facebook...")
  await page.goto("https://www.facebook.com", {
    waitUntil: "networkidle",
    timeout: 60000,
  })

  await humanDelay(page, 1000, 2000)

  // Check if already logged in
  const cookies = await context.cookies()
  let hasSession = cookies.some((c: any) => c.name === "c_user" && c.value)
  if (hasSession) {
    console.log("[Login] Already logged in!")
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
    await browser.close()
    process.exit(0)
  }

  const hasLoginForm = await page.evaluate(() =>
    !!document.querySelector('input[name="email"], #email')
  ).catch(() => false)

  if (!hasLoginForm) {
    console.log("[Login] No login form found — might already be on the page")
    // Wait and check again
    await page.waitForTimeout(5000)
  }

  // Fill email with human-like typing
  const emailInput = page.locator('input[name="email"], #email').first()
  if (await emailInput.isVisible().catch(() => false)) {
    await moveMouse(page, 'input[name="email"], #email')
    await emailInput.click()
    await humanDelay(page, 100, 300)
    await emailInput.fill("")
    for (const char of fbEmail) {
      await emailInput.press(char)
      await page.waitForTimeout(randomBetween(30, 120))
    }
  }

  await humanDelay(page, 300, 800)

  // Fill password with human-like typing
  const passInput = page.locator('input[name="pass"], #pass').first()
  if (await passInput.isVisible().catch(() => false)) {
    await moveMouse(page, 'input[name="pass"], #pass')
    await passInput.click()
    await humanDelay(page, 100, 300)
    await passInput.fill("")
    for (const char of fbPassword) {
      await passInput.press(char)
      await page.waitForTimeout(randomBetween(20, 80))
    }
  }

  await humanDelay(page, 500, 1000)

  // Click login button
  const loginBtn = page.locator("button").filter({ hasText: /log in|log in/i }).first()
  if (await loginBtn.isVisible().catch(() => false)) {
    await moveMouse(page, "button")
    await loginBtn.click()
  } else {
    // Fallback: press Enter
    await page.keyboard.press("Enter")
  }

  console.log("[Login] Waiting for login to complete...")

  for (let i = 0; i < 60; i++) {
    const c = await context.cookies()
    hasSession = c.some((cc: any) => cc.name === "c_user" && cc.value)
    if (hasSession) {
      fs.writeFileSync(COOKIE_PATH, JSON.stringify(c, null, 2))
      console.log("[Login] Login successful! Cookies saved.")
      await browser.close()
      process.exit(0)
    }

    const url = page.url()
    if (url.includes("checkpoint") || url.includes("twofactor")) {
      console.log("[Login] Hit checkpoint/2FA — needs manual login.")
      console.log("[Login] Run 'npm run loginfb:local' on your PC once to log in manually.")
      await browser.close()
      process.exit(1)
    }

    const mfaCode = page.locator("input").filter({ has: page.locator('[placeholder*="code" i]') })
    if (await mfaCode.isVisible().catch(() => false)) {
      console.log("[Login] 2FA code input detected — waiting for manual entry...")
    }

    await page.waitForTimeout(1500)
    if (i % 10 === 9) console.log(`[Login] Still waiting... (${i + 1}/60)`)
  }

  console.log("[Login] Login timed out after 90 seconds")
  await browser.close()
  process.exit(1)
}

main().catch((err) => {
  console.error("[Login] Error:", err)
  process.exit(1)
})
