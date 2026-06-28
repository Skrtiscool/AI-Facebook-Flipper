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
    return false
  }
  if (!Array.isArray(cookies) || cookies.length === 0) return false
  const hasSession = cookies.some(
    (c: any) =>
      (c.name === "c_user" || c.name === "xs") &&
      c.value &&
      c.value.length > 0 &&
      (!c.expires || c.expires > Date.now() / 1000)
  )
  if (!hasSession) return false
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
  // Quick check first — do we even have saved session cookies?
  if (!hasSavedSession()) {
    console.log("[Scanner] No valid Facebook session saved")
    return false
  }

  // Load the cookies and verify they work
  const loaded = await loadCookies(context)
  if (!loaded) {
    console.log("[Scanner] Failed to load session cookies")
    return false
  }

  const page = await context.newPage()

  try {
    // Quick navigation to verify session works
    const response = await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    })

    if (!response || !response.ok()) {
      console.log("[Scanner] Facebook returned error — auth may be invalid")
      await page.close()
      return false
    }

    // Check if we hit a login wall by looking for login form
    const needsLogin = await page.evaluate(() => {
      return !!(
        document.querySelector('input[name="email"]') ||
        document.querySelector('input[name="pass"]') ||
        document.querySelector("#email") ||
        document.querySelector("#pass")
      )
    })

    if (needsLogin) {
      console.log("[Scanner] Session cookies expired — login form detected")
      await page.close()
      return false
    }

    console.log("[Scanner] Authenticated to Facebook")
    await page.close()
    return true
  } catch (error) {
    console.error("[Scanner] Auth check error:", error)
    await page.close()
    return false
  }
}
