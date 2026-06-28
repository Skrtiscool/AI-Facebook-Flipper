export interface Deal {
  id: string
  userId: string
  title: string
  description: string
  price: number
  estimatedValue: number
  profit: number
  score: number
  recommendation: "buy" | "pass" | "maybe"
  reason: string
  confidence: number
  platform?: string
  listingUrl?: string
  imageUrls: string[]
  brand?: string
  condition?: string
  location?: string
  createdAt: string
}

export interface AnalysisInput {
  title: string
  description: string
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

export interface DashboardStats {
  totalDeals: number
  averageProfit: number
  bestFlip: Deal | null
  savedOpportunities: number
}

export interface PricingTier {
  name: string
  price: number
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}
