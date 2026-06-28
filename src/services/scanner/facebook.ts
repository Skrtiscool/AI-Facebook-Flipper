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

    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 })

    await page.waitForTimeout(3000)

    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, 2000)
        await new Promise((r) => setTimeout(r, 1000))
      }
    })

    await page.waitForTimeout(2000)

    const listings = await page.evaluate(() => {
      const items: MarketplaceListing[] = []
      const cards = document.querySelectorAll('[data-render-location="marketplace_search"]')

      cards.forEach((card) => {
        const link = card.querySelector("a")
        const titleEl = card.querySelector("[role='heading']")
        const priceEl = card.querySelector("span:first-child")
        const imgEl = card.querySelector("img")

        if (titleEl && priceEl) {
          items.push({
            title: titleEl.textContent?.trim() || "",
            price: parseFloat(priceEl.textContent?.replace(/[^0-9.]/g, "") || "0"),
            imageUrls: imgEl ? [imgEl.getAttribute("src") || ""] : [],
            location: "",
            listingUrl: link?.getAttribute("href") || "",
            condition: "Unknown",
            description: "",
          })
        }
      })

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

export async function getListingDetails(
  context: BrowserContext,
  url: string
): Promise<Partial<MarketplaceListing>> {
  const page = await context.newPage()

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
    await page.waitForTimeout(2000)

    const details = await page.evaluate(() => {
      const titleEl = document.querySelector("[role='heading']")
      const priceEls = document.querySelectorAll("span")
      const descEl = document.querySelector("[data-ad-preview='message']")

      let price = 0
      priceEls.forEach((el) => {
        const text = el.textContent || ""
        const match = text.match(/\$([0-9,]+)/)
        if (match) {
          price = parseFloat(match[1].replace(/,/g, ""))
        }
      })

      return {
        title: titleEl?.textContent?.trim() || "",
        price,
        description: descEl?.textContent?.trim() || "",
        location: "",
        condition: "Unknown",
      }
    })

    return details
  } catch (error) {
    console.error(`[Scanner] Detail fetch error:`, error)
    return {}
  } finally {
    await page.close()
  }
}
