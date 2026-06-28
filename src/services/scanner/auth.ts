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
    // Check for a valid Facebook session cookie (c_user or xs)
    const hasSessionCookie = cookies.some(
      (c: any) =>
        c.name === "c_user" &&
        c.value &&
        c.value.length > 0 &&
        (!c.expires || c.expires > Date.now() / 1000)
    )
    return hasSessionCookie
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
    await page.goto("https://www.facebook.com/marketplace", {
      waitUntil: "networkidle",
      timeout: 30000,
    })

    const isLoggedIn = !page.url().includes("login")

    if (isLoggedIn) {
      console.log("[Scanner] Already authenticated to Facebook")
      await page.close()
      return true
    }

    const hadCookies = await loadCookies(context)
    if (hadCookies) {
      await page.goto("https://www.facebook.com/marketplace", {
        waitUntil: "networkidle",
        timeout: 30000,
      })
      const stillLoggedIn = !page.url().includes("login")
      if (stillLoggedIn) {
        console.log("[Scanner] Authenticated with saved cookies")
        await page.close()
        return true
      }
    }

    console.log("[Scanner] Needs Facebook login")
    await page.close()
    return false
  } catch (error) {
    console.error("[Scanner] Auth check error:", error)
    await page.close()
    return false
  }
}
