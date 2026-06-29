import { runScan, cleanupBrowser } from "@/services/scanner"

async function main() {
  console.log("[CLI] Starting scan...")
  const result = await runScan()
  console.log(`[CLI] Scan complete — ${result.scanned} listings, ${result.found} deals`)
  await cleanupBrowser()
  process.exit(0)
}

main().catch((err) => {
  console.error("[CLI] Scan failed:", err)
  cleanupBrowser().finally(() => process.exit(1))
})
