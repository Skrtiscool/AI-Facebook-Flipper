import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
})

export function getStripePriceId(plan: string): string {
  const prices: Record<string, string> = {
    pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
    elite: process.env.STRIPE_ELITE_PRICE_ID ?? "",
  }
  return prices[plan] ?? ""
}
