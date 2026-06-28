export interface MarketData {
  averagePrice: number
  priceRange: { min: number; max: number }
  demandTrend: "increasing" | "stable" | "decreasing"
  averageDaysToSell: number
  similarListings: number
  seasonality: string[]
}

export async function getMarketData(query: string): Promise<MarketData> {
  // Placeholder for future marketplace API integrations
  // Will connect to eBay, OfferUp, Facebook Marketplace APIs

  return {
    averagePrice: 0,
    priceRange: { min: 0, max: 0 },
    demandTrend: "stable",
    averageDaysToSell: 14,
    similarListings: 0,
    seasonality: [],
  }
}

export function calculateFees(
  salePrice: number,
  platform: "ebay" | "facebook" | "offerup" | "poshmark"
): number {
  const feeRates: Record<string, number> = {
    ebay: 0.135,
    facebook: 0,
    offerup: 0,
    poshmark: 0.20,
  }

  const rate = feeRates[platform] ?? 0.10
  return Math.round(salePrice * rate * 100) / 100
}

export function calculateShipping(
  weight: number,
  dimensions: { length: number; width: number; height: number },
  fromZip: string,
  toZip: string
): number {
  // Placeholder for USPS/FedEx/UPS rate calculation
  return 0
}
