import { Browser, BrowserContext } from "playwright"

export interface EbaySoldResult {
  averagePrice: number
  medianPrice: number
  minPrice: number
  maxPrice: number
  soldCount: number
  prices: number[]
}

export async function searchSoldPrices(
  context: BrowserContext,
  query: string
): Promise<EbaySoldResult | null> {
  const page = await context.newPage()

  try {
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1&LH_ItemCondition=3000`
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 })
    await page.waitForTimeout(2000)

    const result = await page.evaluate(() => {
      const prices: number[] = []

      // eBay shows sold items with strikethrough prices
      const items = document.querySelectorAll(".s-item")
      for (const item of items) {
        // Skip the "shop by category" card
        if (item.querySelector(".s-item__title--tag")) continue

        const priceEl = item.querySelector(".s-item__price")
        if (!priceEl) continue

        const priceText = priceEl.textContent?.trim() || ""
        const match = priceText.match(/\$([0-9,]+\.?\d*)/)
        if (match) {
          const price = parseFloat(match[1].replace(/,/g, ""))
          if (price > 0 && price < 100000) prices.push(price)
        }
      }

      return prices
    })

    if (result.length < 2) return null

    const sorted = [...result].sort((a, b) => a - b)
    const avg = result.reduce((s, p) => s + p, 0) / result.length
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    return {
      averagePrice: Math.round(avg),
      medianPrice: Math.round(median),
      minPrice: sorted[0],
      maxPrice: sorted[sorted.length - 1],
      soldCount: result.length,
      prices: sorted,
    }
  } catch {
    return null
  } finally {
    await page.close()
  }
}
