"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, SignUpButton } from "@clerk/nextjs"
import { ArrowRight, Sparkles, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const PRICING_TIERS = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "10 scans per month",
      "Basic analysis scores",
      "Discord alerts",
      "Saved deals pipeline",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 19.99,
    description: "For serious resellers",
    highlighted: true,
    features: [
      "Unlimited scans",
      "AI-powered analysis",
      "Discord + SMS alerts",
      "Price drop detection",
      "CSV export",
      "Priority support",
    ],
  },
  {
    id: "biz" as const,
    name: "Business",
    price: 34.99,
    description: "For power flippers & teams",
    features: [
      "Everything in Pro",
      "Auto-respond to sellers",
      "Auto-list to eBay",
      "Team accounts (3 seats)",
      "API access",
      "Dedicated support",
    ],
  },
]

export default function PricingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function startCheckout(plan: string) {
    if (!isSignedIn) {
      router.push("/sign-up")
      return
    }
    setLoading(plan)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error(data.error || "Checkout failed")
    } catch (e: any) {
      toast.error(e.message || "Checkout error")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-xs">
            Pricing
          </Badge>
          <h1 className="text-3xl font-bold">Pick Your Plan</h1>
          <p className="mt-2 text-muted-foreground">Upgrade anytime. Cancel anytime.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <Card key={tier.id} className={cn(
              "glass relative border-0 p-6 sm:p-8",
              tier.highlighted && "ring-1 ring-primary shadow-lg shadow-primary/10"
            )}>
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs rounded-full px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold">${tier.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>

              {tier.price === 0 ? (
                <SignUpButton mode="modal">
                  <Button className="mt-6 w-full" variant="outline">Get Started</Button>
                </SignUpButton>
              ) : (
                <Button
                  className="mt-6 w-full"
                  variant={tier.highlighted ? "default" : "outline"}
                  disabled={loading === tier.id}
                  onClick={() => startCheckout(tier.id)}
                >
                  {loading === tier.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              )}

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="link" onClick={() => router.push("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
