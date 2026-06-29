export interface AnalysisInput {
  title: string
  description?: string
  price: number
  condition: string
  brand?: string
  location?: string
  images?: string[]
}

export interface AnalysisResult {
  estimatedValue: number
  profit: number
  score: number
  recommendation: "buy" | "pass" | "maybe"
  reason: string
  confidence: number
  marketAnalysis: string[]
}

export async function analyzeWithFallback(
  input: AnalysisInput
): Promise<AnalysisResult> {
  return generateFallbackAnalysis(input)
}

function generateEbayAnalysis(
  input: AnalysisInput,
  ebay: { averagePrice: number; medianPrice: number; minPrice: number; maxPrice: number; soldCount: number; prices: number[] }
): AnalysisResult {
  const estimatedValue = ebay.medianPrice
  const profit = Math.round((estimatedValue - input.price) * 0.85) // ~15% fees
  const margin = input.price > 0 ? profit / input.price : 0

  const score = Math.min(100, Math.round(
    (margin > 0.3 ? 40 : margin > 0.15 ? 25 : margin > 0 ? 10 : 0) +
    (ebay.soldCount > 20 ? 25 : ebay.soldCount > 10 ? 15 : ebay.soldCount > 3 ? 10 : 5) +
    (estimatedValue > input.price ? 20 : -10) +
    (ebay.maxPrice > estimatedValue * 1.5 ? 10 : 5)
  ))

  const recommendation: "buy" | "pass" | "maybe" = score >= 70 ? "buy" : score >= 40 ? "maybe" : "pass"

  const priceRange = `$${ebay.minPrice} – $${ebay.maxPrice}`
  const reasons = [
    estimatedValue > input.price
      ? `Resells for ~$${estimatedValue} on eBay (${ebay.soldCount} sold)`
      : `Similar items sell for only ~$${estimatedValue} on eBay`,
    margin > 0.2
      ? `Good margin of ${Math.round(margin * 100)}% after fees`
      : `Tight margin of ${Math.round(margin * 100)}% after fees`,
  ]

  return {
    estimatedValue,
    profit,
    score,
    recommendation,
    reason: reasons.join(". ") + ".",
    confidence: Math.min(1, ebay.soldCount / 50 + 0.2),
    marketAnalysis: [
      `eBay sold range: ${priceRange} (${ebay.soldCount} items)`,
      `eBay median: $${ebay.medianPrice}`,
      `Potential profit: $${profit} (${Math.round(margin * 100)}% margin)`,
    ],
  }
}

const BRANDS: [RegExp, number, string][] = [
  [/milwaukee|dewalt|makita/i, 1.5, "Premium power tool brand with strong resale"],
  [/apple|iphone|ipad|macbook|airpods|apple watch/i, 1.6, "Apple products hold value extremely well"],
  [/sony|bose|samsung|lg|dyson/i, 1.4, "Premium electronics brand with good resale"],
  [/nintendo|playstation|xbox|ps5|ps4|switch/i, 1.3, "Gaming consoles have strong resale demand"],
  [/lego/i, 1.5, "Lego sets often appreciate in value"],
  [/patagonia|north face|canada goose|arc'teryx/i, 1.3, "Premium outdoor brand with loyal resale market"],
  [/supreme|yeezy|jordan|nike|adidas/i, 1.3, "Streetwear has strong resale market"],
  [/canon|nikon|fujifilm|sony alpha/i, 1.3, "Camera equipment holds value well"],
  [/truck|ford f-?150|ram|silverado|tacoma/i, 1.2, "Trucks have strong resale demand"],
]

function getBrandInfo(title: string): { multiplier: number; reason: string } {
  for (const [pattern, multiplier, reason] of BRANDS) {
    if (pattern.test(title)) return { multiplier, reason }
  }
  return { multiplier: 1.0, reason: "Generic item with moderate resale" }
}

function generateFallbackAnalysis(input: AnalysisInput): AnalysisResult {
  const brand = getBrandInfo(input.title)
  const price = input.price
  const cond = input.condition.toLowerCase()

  const condMul = /new|like new|excellent/i.test(cond) ? 1.3
    : /good|gently|used/i.test(cond) ? 1.1
    : /fair|poor|for parts/i.test(cond) ? 0.6
    : 1.0

  let estMul = brand.multiplier * condMul
  if (price < 20) estMul *= 0.8
  else if (price > 500) estMul *= 1.1
  else if (price > 1000) estMul *= 0.9

  const estimatedValue = Math.round(price * estMul)
  const profit = estimatedValue - price
  const margin = price > 0 ? profit / price : 0

  // Compute fine-grained score from many factors
  let score = 0

  // Margin points (0–35)
  if (margin > 0.8) score += 35
  else if (margin > 0.5) score += 28
  else if (margin > 0.35) score += 22
  else if (margin > 0.2) score += 16
  else if (margin > 0.1) score += 10
  else if (margin > 0) score += 4
  else score -= 10

  // Brand points (0–20)
  const brandPoints = Math.round((brand.multiplier - 1) * 40)
  score += Math.max(0, brandPoints)

  // Condition points (0–15)
  if (condMul > 1.2) score += 15
  else if (condMul > 1.05) score += 10
  else if (condMul > 0.95) score += 6
  else score += 2

  // Price sweet-spot points (0–15)
  if (price >= 40 && price <= 80) score += 15
  else if (price >= 20 && price < 40) score += 10
  else if (price > 80 && price <= 150) score += 12
  else if (price > 150 && price <= 300) score += 8
  else if (price > 300 && price <= 600) score += 4
  else if (price > 600 && price <= 1200) score += 2
  else if (price <= 10) score -= 5
  else score -= 2

  // Absolute profit bonus (0–15)
  if (profit > 1000) score += 15
  else if (profit > 500) score += 12
  else if (profit > 200) score += 8
  else if (profit > 100) score += 5
  else if (profit > 50) score += 3
  else if (profit > 20) score += 1

  // Title length indicates listing quality
  const wordCount = input.title.split(/\s+/).length
  if (wordCount >= 6) score += 5
  else if (wordCount >= 3) score += 2

  score = Math.max(0, Math.min(100, score))

  const recommendation: "buy" | "pass" | "maybe" = score >= 72 ? "buy" : score >= 45 ? "maybe" : "pass"

  return {
    estimatedValue,
    profit,
    score,
    recommendation,
    reason: `${brand.reason}. ${recommendation === "buy" ? "Strong flipping opportunity — good margins." : recommendation === "maybe" ? "Decent potential, worth a closer look." : "Low margins, probably not worth it."}`,
    confidence: 0.3 + (score / 100) * 0.35,
    marketAnalysis: [
      `Est. resale: ~$${estimatedValue} (${Math.round(margin * 100)}% margin)`,
      `Condition: ${input.condition || "Unknown"}`,
      `Score: ${score}/100 — ${recommendation.toUpperCase()}`,
    ],
  }
}
