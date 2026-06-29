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
      channel: "chrome",
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
    let activeAlerts = await prisma.alert.findMany({
      where: { active: true },
      include: { user: true },
    })

    if (activeAlerts.length === 0) {
      console.log("[Scanner] No alerts configured — using default scan")
      // Get any user to assign deals to
      const anyUser = await prisma.user.findFirst()
      if (!anyUser) {
        console.log("[Scanner] No users in database — skipping scan")
        await prisma.scannerRun.update({
          where: { id: scanRun.id },
          data: { status: "completed", completedAt: new Date() },
        })
        return { scanned: 0, found: 0 }
      }
      // Scan popular flipping categories by default
      activeAlerts = DEFAULT_KEYWORDS.map((kw) => ({
        id: "default",
        name: kw,
        keywords: [kw],
        brands: [],
        maxPrice: null,
        minProfit: 20,
        minScore: 50,
        active: true,
        userId: anyUser.id,
        user: anyUser,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastRunAt: null,
      })) as any
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

    const CONCURRENCY = 3

    for (const alert of activeAlerts) {
      console.log(`[Scanner] Processing alert: ${alert.name}`)

      const chunks: string[][] = []
      for (let i = 0; i < alert.keywords.length; i += CONCURRENCY) {
        chunks.push(alert.keywords.slice(i, i + CONCURRENCY))
      }

      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map((keyword) =>
            searchMarketplace(context, keyword, alert.maxPrice ?? undefined)
          )
        )

        for (const listings of results) {
          for (const listing of listings) {
          totalScanned++

          // Skip obvious fake/negotiation prices
          const p = listing.price
          const pStr = String(Math.round(p))
          const allSameDigit = pStr.length > 1 && pStr.split("").every(d => d === pStr[0])
          const isSequential = pStr === "12345" || pStr === "123456" || pStr === "1234567"
          if (p <= 1 || p <= 3 || allSameDigit || isSequential) {
            continue
          }

          const analysis = await analyzeWithFallback({
            title: listing.title,
            description: listing.description,
            price: listing.price,
            condition: listing.condition || "Unknown",
            brand: "",
            location: listing.location,
          })

          if (analysis.score >= (alert.minScore ?? 40) && analysis.profit >= (alert.minProfit ?? 0)) {
            // Check if this listing already exists (by URL)
            const existing = listing.listingUrl
              ? await prisma.deal.findFirst({ where: { listingUrl: listing.listingUrl } })
              : null

            let deal
            if (existing) {
              // Price drop detection
              const oldPrice = existing.price
              if (listing.price < oldPrice) {
                await prisma.priceChange.create({
                  data: {
                    dealId: existing.id,
                    oldPrice,
                    newPrice: listing.price,
                  },
                })
                await prisma.deal.update({
                  where: { id: existing.id },
                  data: {
                    price: listing.price,
                    lastSeenPrice: oldPrice,
                    lastPriceDrop: new Date(),
                    scanCount: { increment: 1 },
                    priceHistory: [
                      ...(Array.isArray(existing.priceHistory) ? existing.priceHistory : []),
                      { price: listing.price, date: new Date().toISOString() },
                    ],
                    imageUrls: listing.imageUrls,
                  },
                })
              } else {
                await prisma.deal.update({
                  where: { id: existing.id },
                  data: { scanCount: { increment: 1 } },
                })
              }
              deal = existing
            } else {
              deal = await prisma.deal.create({
                data: {
                  userId: alert.userId,
                  ...(alert.id !== "default" ? { alertId: alert.id } : {}),
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
                  priceHistory: [{ price: listing.price, date: new Date().toISOString() }],
                },
              })
            }

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
      }

      if (alert.id !== "default") {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastRunAt: new Date() },
        }).catch(() => {})
      }
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

const DEFAULT_KEYWORDS = [
  "milwaukee",
  "deWalt",
  "makita",
  "sony",
  "nintendo",
  "apple",
  "lego",
  "patagonia",
  "supreme",
  "yeezy",
]

export async function cleanupBrowser(): Promise<void> {
  if (browser) {
    await browser.close()
    browser = null
  }
}
