let _stripe: any = null

export function getStripe() {
  if (!_stripe) {
    const Stripe = require("stripe")
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2025-02-24.acacia" as any,
    })
  }
  return _stripe
}

export const stripe = new Proxy({}, {
  get(_, prop) {
    return getStripe()[prop]
  },
}) as any

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    scansPerMonth: 10,
    features: [
      "10 scans per month",
      "Basic analysis scores",
      "Discord alerts",
      "Saved deals pipeline",
    ],
  },
  pro: {
    name: "Pro",
    price: 19.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    scansPerMonth: 9999,
    features: [
      "Unlimited scans",
      "AI-powered analysis",
      "Discord + SMS alerts",
      "Price drop detection",
      "CSV export",
      "Priority support",
    ],
  },
  biz: {
    name: "Business",
    price: 34.99,
    priceId: process.env.STRIPE_BIZ_PRICE_ID || "",
    scansPerMonth: 99999,
    features: [
      "Everything in Pro",
      "Auto-respond to sellers",
      "Auto-list to eBay",
      "Team accounts (3 seats)",
      "API access",
      "Dedicated support",
    ],
  },
}

export type PlanId = keyof typeof PLANS
