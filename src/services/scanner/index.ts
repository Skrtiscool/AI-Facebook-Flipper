import { chromium, Browser } from "playwright"
import { ensureAuthenticated, saveCookies } from "./auth"
import { searchMarketplace, MarketplaceListing } from "./facebook"
import { analyzeWithFallback } from "@/services/aiAnalyzer"
import { prisma } from "@/lib/prisma"
import { sendDealAlert } from "@/services/notifications/discord"
import type { AnalysisResult } from "@/services/aiAnalyzer"

let browser: Browser | null = null
let scanInProgress = false

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })
  }
  return browser
}

export async function runScan(): Promise<{
  scanned: number
  found: number
}> {
  if (scanInProgress) {
    console.log("[Scanner] Scan already in progress, skipping")
    return { scanned: 0, found: 0 }
  }

  scanInProgress = true
  const scanRun = await prisma.scannerRun.create({
    data: { status: "running" },
  })

  let totalScanned = 0
  let totalFound = 0

  try {
    const activeAlerts = await prisma.alert.findMany({
      where: { active: true },
      include: { user: true },
    })

    if (activeAlerts.length === 0) {
      console.log("[Scanner] No active alerts to scan")
      await prisma.scannerRun.update({
        where: { id: scanRun.id },
        data: { status: "completed", completedAt: new Date() },
      })
      return { scanned: 0, found: 0 }
    }

    const brw = await getBrowser()
    const context = await brw.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    })

    const authenticated = await ensureAuthenticated(context)
    if (!authenticated) {
      console.log("[Scanner] Cannot scan — needs Facebook login")
      await prisma.scannerRun.update({
        where: { id: scanRun.id },
        data: { status: "failed", error: "Facebook auth required" },
      })
      await context.close()
      return { scanned: 0, found: 0 }
    }

    await saveCookies(context)

    for (const alert of activeAlerts) {
      console.log(`[Scanner] Processing alert: ${alert.name}`)

      for (const keyword of alert.keywords) {
        const listings = await searchMarketplace(
          context,
          keyword,
          alert.maxPrice ?? undefined
        )

        for (const listing of listings) {
          totalScanned++

          const analysis = await analyzeWithFallback({
            title: listing.title,
            description: listing.description,
            price: listing.price,
            condition: listing.condition || "Unknown",
            brand: "",
            location: listing.location,
          })

          if (analysis.score >= (alert.minScore ?? 40) && analysis.profit >= (alert.minProfit ?? 0)) {
            const deal = await prisma.deal.create({
              data: {
                userId: alert.userId,
                alertId: alert.id,
                title: listing.title,
                price: listing.price,
                estimatedValue: analysis.estimatedValue,
                profit: analysis.profit,
                score: analysis.score,
                recommendation: analysis.recommendation,
                reason: analysis.reason,
                confidence: analysis.confidence,
                platform: "facebook",
                listingUrl: listing.listingUrl,
                imageUrls: listing.imageUrls,
                location: listing.location,
                condition: listing.condition,
              },
            })

            totalFound++

            const channels = await prisma.notificationChannel.findMany({
              where: { userId: alert.userId, enabled: true },
            })

            for (const channel of channels) {
              if (channel.type === "discord") {
                try {
                  await sendDealAlert(JSON.parse(channel.config), deal, analysis)
                } catch (e) {
                  console.error("[Scanner] Discord alert failed:", e)
                }
              }
            }
          }
        }
      }

      await prisma.alert.update({
        where: { id: alert.id },
        data: { lastRunAt: new Date() },
      })
    }

    await context.close()

    await prisma.scannerRun.update({
      where: { id: scanRun.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        listingsScanned: totalScanned,
        dealsFound: totalFound,
      },
    })

    console.log(
      `[Scanner] Scan complete — ${totalScanned} listings, ${totalFound} deals found`
    )
  } catch (error) {
    console.error("[Scanner] Scan error:", error)
    await prisma.scannerRun.update({
      where: { id: scanRun.id },
      data: {
        status: "failed",
        error: String(error),
        completedAt: new Date(),
      },
    })
  } finally {
    scanInProgress = false
  }

  return { scanned: totalScanned, found: totalFound }
}

export async function cleanupBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}
