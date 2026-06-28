"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Search,
  Upload,
  Sparkles,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Enter a valid price"),
  condition: z.string().min(1, "Select a condition"),
  brand: z.string().optional(),
  location: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const conditions = [
  "New",
  "Like New",
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "For Parts",
]

export default function AnalyzePage() {
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<null | {
    estimatedValue: number
    profit: number
    score: number
    recommendation: string
    reason: string
    confidence: number
  }>(null)
  const [images, setImages] = useState<string[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: FormData) {
    setAnalyzing(true)
    setResult(null)

    // Simulate AI analysis
    await new Promise((r) => setTimeout(r, 2500))

    setResult({
      estimatedValue: 350,
      profit: 180,
      score: 94,
      recommendation: "buy",
      reason:
        "Strong resale demand, excellent brand recognition, listed below average market price. Milwaukee M18 Fuel tools maintain 85% of their value on the secondary market.",
      confidence: 0.92,
    })
    setAnalyzing(false)
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const profitColor =
    result && result.profit > 0 ? "text-emerald-400" : "text-red-400"

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Analyze Item</h1>
        <p className="text-muted-foreground">
          Enter listing details to get an AI-powered profit analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          <Card className="glass border-0">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Listing Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Milwaukee M18 Fuel Drill Kit"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Paste the listing description here..."
                    rows={4}
                    {...form.register("description")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      placeholder="120"
                      {...form.register("price")}
                    />
                    {form.formState.errors.price && (
                      <p className="text-xs text-red-400">{form.formState.errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition *</Label>
                    <select
                      {...form.register("condition")}
                      className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select condition</option>
                      {conditions.map((c) => (
                        <option key={c} value={c} className="dark:bg-card">{c}</option>
                      ))}
                    </select>
                    {form.formState.errors.condition && (
                      <p className="text-xs text-red-400">{form.formState.errors.condition.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" placeholder="e.g. Milwaukee" {...form.register("brand")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="City, State" {...form.register("location")} />
                  </div>
                </div>

                {/* Image upload */}
                <div className="space-y-2">
                  <Label>Photos</Label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-border">
                        <img src={img} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border transition-colors hover:border-primary">
                      <ImagePlus className="h-5 w-5 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full gap-2" disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {analyzing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="glass border-0">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Analyzing...</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Recommendation badge */}
                <Card className="glass border-0">
                  <CardContent className="p-6 text-center">
                    <Badge
                      className={cn(
                        "mb-3 px-4 py-1.5 text-sm",
                        result.recommendation === "buy"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-red-500/20 text-red-400"
                      )}
                    >
                      {result.recommendation === "buy" ? "RECOMMENDED: BUY" : "RECOMMENDED: PASS"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </CardContent>
                </Card>

                {/* Deal score */}
                <Card className="glass border-0">
                  <CardContent className="p-6 text-center">
                    <div className="relative mx-auto mb-2 flex h-24 w-24 items-center justify-center">
                      <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="6"
                          strokeDasharray={`${result.score * 2.83} 283`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-2xl font-bold">{result.score}</span>
                    </div>
                    <p className="text-sm font-medium">Deal Score</p>
                    <p className="text-xs text-muted-foreground">out of 100</p>
                  </CardContent>
                </Card>

                {/* Stats */}
                <Card className="glass border-0">
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Est. Market Value</span>
                      </div>
                      <span className="text-lg font-bold">${result.estimatedValue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Est. Profit</span>
                      </div>
                      <span className={cn("text-lg font-bold", profitColor)}>
                        ${result.profit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Deal Score</span>
                      </div>
                      <span className="text-lg font-bold">{result.score}/100</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Reason */}
                <Card className="glass border-0">
                  <CardContent className="p-6">
                    <div className="mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Why?</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{result.reason}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
