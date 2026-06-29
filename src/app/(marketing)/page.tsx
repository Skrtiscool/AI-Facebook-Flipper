"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import {
  ArrowRight,
  Sparkles,
  Search,
  Clock,
  Bell,
  TrendingUp,
  Sliders,
  LayoutDashboard,
  Zap,
  Check,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
}

const stagger = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
}

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [isLoaded, isSignedIn, router])

  async function startCheckout(plan: string) {
    setCheckoutLoading(plan)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || "Checkout failed")
    } catch (e: any) {
      alert("Checkout error: " + e.message)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong mx-4 mt-4 max-w-7xl rounded-2xl px-6 py-3 md:mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">FlipScout</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 md:flex">
              <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Pricing
              </a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {!isLoaded ? null : !isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="gap-1">
                      Get Started <ArrowRight className="h-3 w-3" />
                    </Button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton />
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 md:hidden">
              <a href="#how-it-works" className="text-sm text-muted-foreground">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground">Pricing</a>
              <div className="flex gap-2 pt-2">
                {!isLoaded ? null : !isSignedIn ? (
                  <>
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm" className="flex-1">Sign In</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button size="sm" className="flex-1">Get Started</Button>
                    </SignUpButton>
                  </>
                ) : (
                  <UserButton />
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1 rounded-full px-4 py-1.5 text-xs">
              <Sparkles className="h-3 w-3" /> Automated Marketplace Scanner
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            We Scan Facebook Marketplace 24/7{" "}
            <span className="gradient-text">So You Don't Have To.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            FlipScout runs in the background, scanning thousands of listings every 30 minutes. When it finds a profitable flip, you get an instant Discord alert.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <SignUpButton mode="modal">
              <Button size="lg" className="h-12 gap-2 px-8 text-base">
                Start Scanning <ArrowRight className="h-4 w-4" />
              </Button>
            </SignUpButton>
            <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base" onClick={scrollToHowItWorks}>
              See How It Works <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Hero demo card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-strong mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl p-6 text-left"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Search className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Analyzing Listing</p>
                <p className="text-xs text-muted-foreground">Milwaukee M18 Fuel Drill Kit</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">BUY</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="glass rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Listed Price</p>
                <p className="text-base sm:text-lg font-bold">$120</p>
              </div>
              <div className="glass rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Est. Value</p>
                <p className="text-base sm:text-lg font-bold text-primary">$350</p>
              </div>
              <div className="glass rounded-xl p-2 sm:p-3 text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">Profit</p>
                <p className="text-base sm:text-lg font-bold text-emerald-400">+$180</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Deal Score: <span className="font-bold text-foreground">94/100</span></p>
              <p className="text-xs text-muted-foreground">Confidence: <span className="font-bold text-foreground">High</span></p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-xs">
              Features
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              Fully Automated Deal Hunting
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Set it up once. FlipScout does the rest — scanning, analyzing, and alerting you to profitable flips.
            </p>
          </motion.div>

          <motion.div {...stagger} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="glass group relative overflow-hidden border-0 p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-xs">
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              From Setup to Alert in Minutes
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Four simple steps to start receiving profitable deal alerts.
            </p>
          </motion.div>

          <div className="relative mt-16">
            {/* Connecting line */}
            <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-primary via-primary/50 to-transparent md:block" />

            <div className="space-y-12 md:space-y-16">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative flex flex-col gap-4 md:flex-row md:items-start"
                >
                  <div className="glass flex h-16 w-16 shrink-0 items-center justify-center rounded-xl md:ml-0">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                  <div className="glass flex-1 rounded-xl p-6">
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <motion.div {...fadeUp} className="text-center">
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-xs">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Start for free, upgrade as you grow.
            </p>
          </motion.div>

          <motion.div {...stagger} className="mt-16 grid gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground text-xs rounded-full px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={cn(
                    "glass relative overflow-hidden border-0 p-8",
                    tier.highlighted && "ring-1 ring-primary shadow-lg shadow-primary/10"
                  )}
                >
                  <h3 className="text-lg font-semibold">{tier.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-sm text-muted-foreground">/{tier.period}</span>
                  </div>
                  {tier.price === 0 ? (
                    <SignUpButton mode="modal">
                      <Button className="mt-6 w-full" variant="outline">Get Started</Button>
                    </SignUpButton>
                  ) : (
                    <Button
                      className={cn("mt-6 w-full")}
                      variant={tier.highlighted ? "default" : "outline"}
                      disabled={checkoutLoading === tier.id}
                      onClick={() => startCheckout(tier.id)}
                    >
                      {checkoutLoading === tier.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        tier.cta
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div {...fadeUp}>
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-xs">
              Get Started
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">
              Ready to Find Your Next Profitable Flip?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join thousands of resellers using FlipScout to make smarter buying decisions.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <SignUpButton mode="modal">
                <Button size="lg" className="h-12 gap-2 px-8 text-base">
                  Start Scanning <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
              <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base" onClick={scrollToHowItWorks}>
                See How It Works
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">FlipScout</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="transition-colors hover:text-foreground">Privacy</a>
              <a href="#" className="transition-colors hover:text-foreground">Terms</a>
              <a href="#" className="transition-colors hover:text-foreground">Contact</a>
              <a href="#" className="transition-colors hover:text-foreground">Twitter</a>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; 2026 FlipScout. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <Clock className="h-5 w-5" />,
    title: "24/7 Auto-Scanner",
    description: "Runs every 30 minutes scanning Facebook Marketplace for deals matching your criteria. No manual searching required.",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Discord Alerts",
    description: "Get instant notifications in your Discord server when a profitable flip is found. Set it up once and forget it.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "AI Profit Analysis",
    description: "Each listing is analyzed by GPT-4o for market value, profit potential, and deal scoring before you're alerted.",
  },
  {
    icon: <Sliders className="h-5 w-5" />,
    title: "Smart Filters",
    description: "Set keywords, brands, max prices, and minimum profit thresholds. Only get alerts for deals worth your time.",
  },
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    title: "Deal Dashboard",
    description: "All discovered deals are saved to your dashboard. Review, save, and track your best opportunities.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    title: "Zero Effort",
    description: "Install once, configure your alerts, and let FlipScout do the work. No daily logins or manual searching.",
  },
]

const steps = [
  {
    number: "01",
    title: "Set Your Alerts",
    description: "Tell FlipScout what you're looking for. Keywords, brands, price range, and minimum profit.",
  },
  {
    number: "02",
    title: "We Scan Every 30 Min",
    description: "Our automated scanner checks Facebook Marketplace for matching listings around the clock.",
  },
  {
    number: "03",
    title: "AI Analyzes Each Find",
    description: "GPT-4o evaluates every listing for market value, profit potential, and deal quality.",
  },
  {
    number: "04",
    title: "Get Discord Alerts",
    description: "When a profitable deal is found, you get an instant alert in Discord with all the details.",
  },
]

const pricingTiers = [
  {
    id: "free" as const,
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for getting started",
    features: [
      "10 scans per month",
      "Basic analysis scores",
      "Discord alerts",
      "Saved deals pipeline",
    ],
    cta: "Get Started",
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 19.99,
    period: "month",
    description: "For serious resellers",
    highlighted: true,
    features: [
      "Unlimited scans",
      "AI-powered analysis",
      "Discord alerts",
      "Price drop detection",
      "CSV export",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    id: "biz" as const,
    name: "Business",
    price: 34.99,
    period: "month",
    description: "For power flippers & teams",
    features: [
      "Everything in Pro",
      "Auto-respond to sellers",
      "Auto-list to eBay",
      "Team accounts (3 seats)",
      "API access",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
  },
]
