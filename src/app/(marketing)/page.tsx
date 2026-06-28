"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Sparkles,
  Search,
  Camera,
  Calculator,
  TrendingUp,
  Bell,
  Bot,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong mx-auto mt-4 max-w-7xl rounded-2xl px-6 py-3 mx-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">FlipScout</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Features
              </a>
              <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                How It Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Pricing
              </a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="gap-1">
                Get Started <ArrowRight className="h-3 w-3" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 md:hidden">
              <a href="#features" className="text-sm text-muted-foreground">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground">Pricing</a>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1">Sign In</Button>
                <Button size="sm" className="flex-1">Get Started</Button>
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
              <Sparkles className="h-3 w-3" /> AI-Powered Marketplace Analysis
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Find Profitable Flips{" "}
            <span className="gradient-text">Before Anyone Else.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            FlipScout uses AI to discover undervalued marketplace deals, predict resale value, and calculate profit instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="lg" className="h-12 gap-2 px-8 text-base">
              Join Waitlist <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base">
              Try Demo <ChevronRight className="h-4 w-4" />
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
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Listed Price</p>
                <p className="text-lg font-bold">$120</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Est. Value</p>
                <p className="text-lg font-bold text-primary">$350</p>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <p className="text-xs text-muted-foreground">Profit</p>
                <p className="text-lg font-bold text-emerald-400">+$180</p>
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
              Everything You Need to Flip Smarter
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Powerful AI tools to analyze, evaluate, and automate your flipping business.
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
              From Listing to Profit in Seconds
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Four simple steps to start finding profitable flips.
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

          <motion.div {...stagger} className="mt-16 grid gap-8 md:grid-cols-3">
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
                  <Button
                    className={cn(
                      "mt-6 w-full",
                      tier.highlighted ? "" : "variant-outline"
                    )}
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    {tier.cta}
                  </Button>
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
              <Button size="lg" className="h-12 gap-2 px-8 text-base">
                Join Waitlist <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 gap-2 px-8 text-base">
                View Demo
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
    icon: <Search className="h-5 w-5" />,
    title: "AI Deal Scanner",
    description: "Scan thousands of marketplace listings instantly. Our AI identifies undervalued items with high profit potential.",
  },
  {
    icon: <Camera className="h-5 w-5" />,
    title: "Image Recognition",
    description: "Upload a photo and let AI identify the item, assess condition, and estimate value based on visual analysis.",
  },
  {
    icon: <Calculator className="h-5 w-5" />,
    title: "Profit Calculator",
    description: "Get instant profit calculations including fees, shipping, and taxes. Know your exact margins before buying.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Market Analysis",
    description: "Real-time market data showing demand trends, price histories, and seasonal patterns for any product category.",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Deal Alerts",
    description: "Set alerts for specific items, brands, or price thresholds. Never miss a profitable listing again.",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "AI Negotiation Assistant",
    description: "Get AI-powered negotiation scripts and price suggestions to help you close deals at the best price.",
  },
]

const steps = [
  {
    number: "01",
    title: "Add a Listing",
    description: "Paste a marketplace URL, enter item details manually, or upload a photo. FlipScout accepts input from any source.",
  },
  {
    number: "02",
    title: "AI Analyzes the Item",
    description: "Our AI scans the listing, analyzes images, checks market data, and evaluates condition to determine true market value.",
  },
  {
    number: "03",
    title: "Profit Calculated",
    description: "FlipScout calculates potential profit after all fees, shipping costs, and taxes. See your exact expected return.",
  },
  {
    number: "04",
    title: "Receive Your Recommendation",
    description: "Get a clear BUY/PASS recommendation with a deal score, confidence rating, and detailed reasoning for each listing.",
  },
]

const pricingTiers = [
  {
    name: "Free",
    price: 0,
    period: "month",
    description: "Perfect for getting started",
    features: [
      "5 analyses per month",
      "Basic profit calculator",
      "Market value estimates",
      "Email support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: 19,
    period: "month",
    description: "For serious resellers",
    highlighted: true,
    features: [
      "Unlimited analyses",
      "AI image recognition",
      "Advanced market data",
      "Deal alerts",
      "Priority support",
    ],
    cta: "Start Free Trial",
  },
  {
    name: "Elite",
    price: 49,
    period: "month",
    description: "For power users & teams",
    features: [
      "Everything in Pro",
      "API access",
      "Marketplace integrations",
      "AI negotiation assistant",
      "Discord alerts",
      "Dedicated support",
    ],
    cta: "Start Free Trial",
  },
]
