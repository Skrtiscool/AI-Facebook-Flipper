import { Browser, BrowserContext } from "playwright"

export interface MarketplaceListing {
  title: string
  price: number
  imageUrls: string[]
  location: string
  listingUrl: string
  condition: string
  description: string
}

export async function searchMarketplace(
  context: BrowserContext,
  query: string,
  maxPrice?: number
): Promise<MarketplaceListing[]> {
  const page = await context.newPage()

  try {
    let url = `https://www.facebook.com/marketplace/search?query=${encodeURIComponent(query)}`
    if (maxPrice) {
      url += `&maxPrice=${maxPrice}`
    }

    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
    if (!response || !response.ok()) {
      console.log(`[Scanner] Search page returned ${response?.status()} for "${query}"`)
      return []
    }

    // Wait for listings to load
    await page.waitForTimeout(4000)

    // Check if we hit a login wall
    const isLoginPage = page.url().includes("login")
    if (isLoginPage) {
      console.log("[Scanner] Redirected to login — session expired")
      return []
    }

    // Scroll to trigger lazy loading
    await page.evaluate(async () => {
      for (let i = 0; i < 8; i++) {
        window.scrollBy(0, 1500)
        await new Promise((r) => setTimeout(r, 800))
      }
    })

    await page.waitForTimeout(2000)

    // Try multiple selector strategies to find listing cards
    const listings = await page.evaluate(() => {
      const items: MarketplaceListing[] = []

      // Strategy 1: Find all article or div elements that look like listing cards
      const cardSelectors = [
        '[data-render-location="marketplace_search"]',
        "article",
        'a[href*="/marketplace/item/"]',
        'div[role="article"]',
      ]

      let cards: Element[] = []
      for (const sel of cardSelectors) {
        const found = document.querySelectorAll(sel)
        if (found.length > 0) {
          cards = Array.from(found)
          break
        }
      }

      // Fallback: look for any link with marketplace/item in href
      if (cards.length === 0) {
        const links = document.querySelectorAll('a[href*="/marketplace/item/"]')
        cards = Array.from(links)
      }

      const processed = new Set<string>()

      for (const card of cards) {
        const link = card.tagName === "A" ? card : card.querySelector("a")
        const href = link?.getAttribute("href") || ""
        const fullUrl = href.startsWith("http") ? href : `https://www.facebook.com${href}`

        // Deduplicate by URL
        if (processed.has(fullUrl)) continue
        processed.add(fullUrl)

        // Get title from various possible locations
        const titleEl =
          card.querySelector('[role="heading"]') ||
          card.querySelector("h3") ||
          card.querySelector("h4") ||
          card.querySelector("span:first-child") ||
          card.querySelector('[data-ad-preview="title"]') ||
          card.querySelector('[data-render-location="marketplace_search"] [role="heading"]')

        // Get price
        const priceEls = card.querySelectorAll("span")
        let price = 0
        for (const el of priceEls) {
          const text = el.textContent?.trim() || ""
          const match = text.match(/^\$?([0-9,]+\.?\d*)/)
          if (match) {
            price = parseFloat(match[1].replace(/,/g, ""))
            if (price > 0) break
          }
        }

        // Get image
        const imgEl = card.querySelector("img")
        const images = imgEl ? [imgEl.getAttribute("src") || ""].filter(Boolean) : []

        const title = titleEl?.textContent?.trim() || ""

        if (title && price > 0) {
          items.push({
            title,
            price,
            imageUrls: images,
            location: "",
            listingUrl: fullUrl,
            condition: "Unknown",
            description: "",
          })
        }
      }

      return items
    })

    console.log(`[Scanner] Found ${listings.length} listings for "${query}"`)
    return listings
  } catch (error) {
    console.error(`[Scanner] Search error for "${query}":`, error)
    return []
  } finally {
    await page.close()
  }
}
