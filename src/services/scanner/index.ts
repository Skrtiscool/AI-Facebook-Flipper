import { chromium, Browser, firefox } from "playwright"
import { ensureAuthenticated, saveCookies } from "./auth"
import { searchMarketplace, MarketplaceListing } from "./facebook"
import { analyzeWithFallback } from "@/services/aiAnalyzer"
import { prisma } from "@/lib/prisma"
import { sendDealAlert } from "@/services/notifications/discord"
import { updateScanProgress, resetScanProgress } from "./progress"
import { PLANS, PlanId } from "@/lib/stripe"
import type { AnalysisResult } from "@/services/aiAnalyzer"

let browser: Browser | null = null
let scanInProgress = false

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    const launchOpts = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    }
    try {
      browser = await chromium.launch(launchOpts)
    } catch {
      console.log("[Scanner] Chromium failed, trying Firefox...")
      browser = await firefox.launch(launchOpts)
    }
  }
  return browser
}

export async function runScan(userId?: string): Promise<{
  scanned: number
  found: number
}> {
  if (scanInProgress) {
    console.log("[Scanner] Scan already in progress, skipping")
    return { scanned: 0, found: 0 }
  }

  scanInProgress = true
  resetScanProgress()

  // Check usage limits
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user) {
      const sub = await prisma.subscription.findUnique({ where: { userId } })
      const plan = (sub?.plan as PlanId) || "free"
      const limit = PLANS[plan].scansPerMonth

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      const scanCount = await prisma.scannerRun.count({
        where: {
          userId,
          startedAt: { gte: monthStart },
          status: "completed",
        },
      })

      if (scanCount >= limit) {
        console.log(`[Scanner] User ${userId} hit scan limit (${limit}), skipping`)
        scanInProgress = false
        return { scanned: 0, found: 0 }
      }
    }
  }
  const scanRun = await prisma.scannerRun.create({
    data: { status: "running", ...(userId ? { userId } : {}) },
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

    const totalKeywords = activeAlerts.reduce((s, a) => s + a.keywords.length, 0)
    let keywordsDone = 0

    for (const alert of activeAlerts) {
      console.log(`[Scanner] Processing alert: ${alert.name}`)

      const chunks: string[][] = []
      for (let i = 0; i < alert.keywords.length; i += CONCURRENCY) {
        chunks.push(alert.keywords.slice(i, i + CONCURRENCY))
      }

      for (const chunk of chunks) {
        keywordsDone += chunk.length
        updateScanProgress({
          status: "running",
          currentKeyword: chunk[0],
          keywordsDone,
          keywordsTotal: totalKeywords,
          message: `Scanning "${chunk[0]}"...`,
        })
        const results = await Promise.all(
          chunk.map((keyword) =>
            searchMarketplace(context, keyword, alert.maxPrice ?? undefined)
          )
        )

        for (const listings of results) {
          updateScanProgress({
            listingsFound: totalScanned + listings.length,
            message: `Scanning "${chunk[0]}" — found ${listings.length} listings`,
          })
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
                await prisma.dealActivity.create({
                  data: {
                    dealId: existing.id,
                    type: "price_drop",
                    message: `Price dropped from $${oldPrice} to $${listing.price}`,
                    metadata: { oldPrice, newPrice: listing.price },
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
              await prisma.dealActivity.create({
                data: {
                  dealId: deal.id,
                  type: "found",
                  message: `Deal found — $${listing.price} with score ${analysis.score}/100`,
                  metadata: { price: listing.price, score: analysis.score },
                },
              })
            }

            totalFound++
            updateScanProgress({ dealsFound: totalFound, message: `Found ${totalFound} deals so far` })

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
    updateScanProgress({
      status: "completed",
      message: `Scan complete — ${totalScanned} listings, ${totalFound} deals`,
    })
  } catch (error) {
    console.error("[Scanner] Scan error:", error)
    updateScanProgress({
      status: "failed",
      message: `Scan failed: ${error}`,
      error: String(error),
    })
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
