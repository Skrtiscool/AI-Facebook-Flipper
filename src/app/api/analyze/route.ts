import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const analyzeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  condition: z.string(),
  brand: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = analyzeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, description, price, condition, brand, location, images } =
      parsed.data

    // In production, this would call the AI service
    // const result = await analyzeWithAI({ title, description, price, condition, brand, location, images })

    // Mock AI analysis for MVP
    const mockResult = generateMockAnalysis(title, price, condition)

    return NextResponse.json(mockResult)
  } catch (error) {
    console.error("Analyze error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

function generateMockAnalysis(
  title: string,
  price: number,
  condition: string
) {
  const brandMultiplier = /milwaukee|deWalt|makita|sony|apple|nintendo|canon|nikon|bose|dyson/i.test(
    title
  )
    ? 1.4
    : 1.0

  const conditionMultiplier =
    condition === "New" || condition === "Like New"
      ? 1.3
      : condition === "Excellent" || condition === "Good"
      ? 1.1
      : 0.8

  const estimatedValue = Math.round(price * brandMultiplier * conditionMultiplier)

  const profit = estimatedValue - price

  const score = Math.min(
    100,
    Math.round(
      ((profit / price) * 50 + brandMultiplier * 25 + conditionMultiplier * 15)
    )
  )

  const recommendation = score >= 70 ? "buy" : score >= 40 ? "maybe" : "pass"

  const reasons = [
    recommendation === "buy"
      ? "Strong resale demand in this category"
      : "Limited resale demand detected",
    brandMultiplier > 1
      ? "Excellent brand recognition and resale value"
      : "Brand has moderate resale value",
    condition === "New" || condition === "Like New"
      ? "Item in excellent condition commands premium pricing"
      : "Condition may affect final selling price",
    profit > 50
      ? "Good margin potential after fees and shipping"
      : "Thin margins after accounting for fees",
  ]

  return {
    estimatedValue,
    profit,
    score,
    recommendation,
    reason: reasons.join(". ") + ".",
    confidence: Math.round((score / 100) * 0.8 + 0.1),
    marketAnalysis: [
      `Average selling price for similar items: $${estimatedValue + Math.round(Math.random() * 50 - 25)}`,
      `Market demand trend: ${score > 60 ? "Increasing" : "Stable"}`,
      `Average days to sell: ${Math.round(14 - (score / 100) * 10)} days`,
    ],
  }
}
