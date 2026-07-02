"use client"

import { useEffect, useState } from "react"
import { usePageTitle } from "@/lib/usePageTitle"
import {
  TrendingUp, TrendingDown, DollarSign, Package, Clock,
  ShoppingCart, BadgeDollarSign,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface PnLData {
  summary: {
    totalDeals: number
    totalListed: number
    totalEstimatedValue: number
    totalProfit: number
    totalActualProfit: number
    totalShipping: number
    totalFees: number
    totalSpent: number
    totalEarned: number
    roi: string
    boughtCount: number
    soldCount: number
    watchingCount: number
  }
  monthly: { month: string; spent: number; earned: number; count: number }[]
}

export default function AnalyticsPage() {
  usePageTitle("Profit & Loss")
  const [data, setData] = useState<PnLData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/pnl")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
  if (!data) return <p className="text-muted-foreground">Failed to load analytics</p>

  const { summary, monthly } = data
  const maxVal = Math.max(...monthly.map(m => Math.max(m.spent, m.earned)), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profit & Loss</h1>
        <p className="text-sm text-muted-foreground">Real flipping performance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" /> Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className="text-xl font-bold text-red-400">${summary.totalSpent.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BadgeDollarSign className="h-3.5 w-3.5" /> Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className="text-xl font-bold text-green-400">${summary.totalEarned.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className={cn("text-xl font-bold", parseFloat(summary.roi) > 0 ? "text-green-400" : "text-red-400")}>
              {summary.roi}%
            </p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Package className="h-3.5 w-3.5" /> Deals
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className="text-xl font-bold">{summary.totalDeals}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="glass border-0">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Watching</p>
            <p className="text-lg font-bold text-blue-400">{summary.watchingCount}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Bought</p>
            <p className="text-lg font-bold text-orange-400">{summary.boughtCount}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Sold</p>
            <p className="text-lg font-bold text-green-400">{summary.soldCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profit breakdown */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Profit Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Profit</span>
            <span className={cn("font-medium", summary.totalProfit > 0 ? "text-green-400" : "text-red-400")}>
              ${summary.totalProfit.toFixed(0)}
            </span>
          </div>
          {summary.totalActualProfit > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Actual Profit</span>
              <span className={cn("font-medium", summary.totalActualProfit > 0 ? "text-green-400" : "text-red-400")}>
                ${summary.totalActualProfit.toFixed(0)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Shipping Paid</span>
            <span className="font-medium text-orange-400">-${summary.totalShipping.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Fees Paid</span>
            <span className="font-medium text-red-400">-${summary.totalFees.toFixed(0)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Monthly chart */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {monthly.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {monthly.map(m => {
                const spentPct = (m.spent / maxVal) * 100
                const earnedPct = (m.earned / maxVal) * 100
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">{m.month}</span>
                      <span className="text-muted-foreground">{m.count} deals</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="w-8 text-muted-foreground">Spent</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-red-500/60 rounded-full transition-all" style={{ width: `${spentPct}%` }} />
                        </div>
                        <span className="w-16 text-right text-red-400">${m.spent.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="w-8 text-muted-foreground">Earned</span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-green-500/60 rounded-full transition-all" style={{ width: `${earnedPct}%` }} />
                        </div>
                        <span className="w-16 text-right text-green-400">${m.earned.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
