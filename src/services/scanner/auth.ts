import { Browser, BrowserContext } from "playwright"
import * as fs from "fs"
import * as path from "path"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")

export async function saveCookies(context: BrowserContext): Promise<void> {
  const cookies = await context.cookies()
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2))
  console.log("[Scanner] Facebook cookies saved")
}

export async function loadCookies(context: BrowserContext): Promise<boolean> {
  if (!fs.existsSync(COOKIE_PATH)) return false
  const raw = fs.readFileSync(COOKIE_PATH, "utf-8")
  let cookies
  try {
    cookies = JSON.parse(raw)
  } catch {
    console.log("[Scanner] Invalid cookie file")
    return false
  }
  if (!Array.isArray(cookies) || cookies.length === 0) return false
  // Must have a Facebook session cookie to be useful
  const hasSession = cookies.some(
    (c: any) =>
      (c.name === "c_user" || c.name === "xs") &&
      c.value &&
      c.value.length > 0 &&
      (!c.expires || c.expires > Date.now() / 1000)
  )
  if (!hasSession) {
    console.log("[Scanner] Cookie file exists but no valid session cookie")
    return false
  }
  await context.addCookies(cookies)
  console.log("[Scanner] Facebook cookies loaded")
  return true
}

export function hasSavedSession(): boolean {
  if (!fs.existsSync(COOKIE_PATH)) return false
  try {
    const raw = fs.readFileSync(COOKIE_PATH, "utf-8")
    const cookies = JSON.parse(raw)
    if (!Array.isArray(cookies)) return false
    return cookies.some(
      (c: any) =>
        (c.name === "c_user" || c.name === "xs") &&
        c.value &&
        c.value.length > 0 &&
        (!c.expires || c.expires > Date.now() / 1000)
    )
  } catch {
    return false
  }
}

export async function clearSession(): Promise<void> {
  if (fs.existsSync(COOKIE_PATH)) {
    fs.unlinkSync(COOKIE_PATH)
    console.log("[Scanner] Facebook session cleared")
  }
}

export async function ensureAuthenticated(
  context: BrowserContext
): Promise<boolean> {
  const page = await context.newPage()

  try {
    const hadCookies = await loadCookies(context)

    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    // Check if actually logged in by looking for Marketplace-specific elements
    const isLoggedIn = await page.evaluate(() => {
      // If we see the marketplace search/feed, we're logged in
      const hasMarketplaceContent =
        document.querySelector('[role="feed"]') ||
        document.querySelector('[data-render-location="marketplace_search"]') ||
        document.querySelector('[aria-label="Marketplace"]') ||
        document.querySelector('a[href*="/marketplace"]') ||
        document.body.innerText.includes("Marketplace")
      return !!hasMarketplaceContent
    })

    if (isLoggedIn) {
      console.log("[Scanner] Authenticated to Facebook")
      await page.close()
      return true
    }

    if (hadCookies) {
      console.log("[Scanner] Cookies present but not logged in — may be expired")
    } else {
      console.log("[Scanner] No Facebook session cookies")
    }

    await page.close()
    return false
  } catch (error) {
    console.error("[Scanner] Auth check error:", error)
    await page.close()
    return false
  }
}
