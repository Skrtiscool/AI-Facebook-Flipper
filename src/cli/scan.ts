import { runScan, cleanupBrowser } from "@/services/scanner"
import * as fs from "fs"
import * as path from "path"

const COOKIE_PATH = path.join(process.cwd(), ".fb-cookies.json")

async function main() {
  const hasCookies = fs.existsSync(COOKIE_PATH) && (() => {
    try {
      const raw = fs.readFileSync(COOKIE_PATH, "utf-8")
      const cookies = JSON.parse(raw)
      return cookies.some(
        (c: any) =>
          (c.name === "c_user" || c.name === "xs") &&
          c.value &&
          c.value.length > 0 &&
          (!c.expires || c.expires > Date.now() / 1000)
      )
    } catch { return false }
  })()

  if (!hasCookies) {
    console.log("No valid Facebook session found.")
    console.log("Run 'npm run loginfb:local' first to log into Facebook.")
    process.exit(1)
  }

  console.log("Starting scan...")
  const result = await runScan()
  console.log(`Done! ${result.scanned} listings scanned, ${result.found} deals found`)
  await cleanupBrowser()
  process.exit(0)
}

main().catch((err) => {
  console.error("Scan failed:", err)
  cleanupBrowser().finally(() => process.exit(1))
})
