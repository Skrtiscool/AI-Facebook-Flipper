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
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, 1200)
        await new Promise((r) => setTimeout(r, 500))
      }
    })

    await page.waitForTimeout(2000)

    // Extract listings using broader selectors
    const listings = await page.evaluate(() => {
      const items: MarketplaceListing[] = []
      const seen = new Set<string>()

      // Find all clickable cards that link to marketplace items
      const links = document.querySelectorAll<HTMLAnchorElement>(
        'a[href*="/marketplace/item/"]'
      )

      for (const link of links) {
        const href = link.getAttribute("href") || ""
        const fullUrl = href.startsWith("http") ? href : `https://www.facebook.com${href}`
        if (seen.has(fullUrl)) continue
        seen.add(fullUrl)

        // Walk up to find the card container
        let card: HTMLElement | null = link
        for (let i = 0; i < 5; i++) {
          if (card?.parentElement) card = card.parentElement
          else break
        }
        const container = card || link

        // Extract title: look for text content that isn't a price or "Just listed"
        const allText = container.textContent?.trim() || ""

        // Try to find a proper title element
        const possibleTitles = container.querySelectorAll(
          'span, div[role="heading"], h3, h4, strong'
        )
        let title = ""
        for (const el of possibleTitles) {
          const text = el.textContent?.trim() || ""
          // Skip if it's just a price, "Just listed", or very short
          if (
            text.length > 3 &&
            !text.startsWith("$") &&
            !text.toLowerCase().includes("just listed") &&
            !text.toLowerCase().includes("recently listed") &&
            !text.toLowerCase().includes("unread") &&
            !/^\$?[\d,]+\.?\d*$/.test(text)
          ) {
            title = text
            break
          }
        }

        // Fallback: use the first substantial text from the card
        if (!title) {
          for (const el of possibleTitles) {
            const text = el.textContent?.trim() || ""
            if (text.length > 3 && !text.startsWith("$")) {
              title = text
              break
            }
          }
        }

        // Last resort: use text before the price in the card's text content
        if (!title) {
          const match = allText.match(/^(.+?)\s+\$/)?.[1]?.trim()
          if (match && match.length > 3) title = match
        }

        // Extract price
        let price = 0
        const priceMatch = allText.match(/\$([0-9,]+\.?\d*)/)
        if (priceMatch) {
          price = parseFloat(priceMatch[1].replace(/,/g, ""))
        }

        // Extract image
        const img = container.querySelector("img")
        const images = img?.getAttribute("src") ? [img.getAttribute("src")!] : []

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
