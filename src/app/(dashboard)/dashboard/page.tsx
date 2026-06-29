"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Play,
  Square,
  Clock,
  Search,
  TrendingUp,
  Trophy,
  Bell,
  ExternalLink,
  Bookmark,
  Check,
  Sparkles,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ScannerStatus {
  running: boolean
  facebookConnected: boolean
  lastRun: { startedAt: string; listingsScanned: number; dealsFound: number } | null
  lastError: string | null
  totalDeals: number
  activeAlerts: number
}

interface Deal {
  id: string
  title: string
  price: number
  estimatedValue: number
  profit: number
  score: number
  recommendation: string
  platform: string | null
  listingUrl: string | null
  imageUrls: string[]
  location: string | null
  reason: string | null
  scannedAt: string
  read: boolean
  saved: boolean
}

export default function DashboardPage() {
  const [status, setStatus] = useState<ScannerStatus | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)

  async function fetchData() {
    try {
      const statusRes = await fetch("/api/scanner/status")
      if (statusRes.ok) setStatus(await statusRes.json())
    } catch {
      // Will retry
    }
    try {
      const dealsRes = await fetch("/api/deals")
      if (dealsRes.ok) setDeals(await dealsRes.json())
    } catch {
      // Will retry
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData().catch(() => {})
    const interval = setInterval(() => { fetchData().catch(() => {}) }, 10000)
    return () => clearInterval(interval)
  }, [])

  async function toggleScanner() {
    setStarting(true)
    try {
      const endpoint = status?.running ? "/api/scanner/stop" : "/api/scanner/start"
      const res = await fetch(endpoint, { method: "POST" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }))
        alert(`Scanner error: ${err.error || err.message || "Unknown error"}`)
      }
    } catch (e: any) {
      alert(`Scanner error: ${e.message}`)
    }
    await fetchData()
    setStarting(false)
  }

  async function toggleSaved(deal: Deal) {
    await fetch("/api/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deal.id, saved: !deal.saved }),
    })
    fetchData()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Scanner Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {status?.running
              ? "Scanner is running — checking for deals every 30 min"
              : "Scanner is stopped"}
          </p>
        </div>
        <Button
          onClick={toggleScanner}
          disabled={starting}
          className={cn(
            "gap-2 w-full sm:w-auto",
            status?.running
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : ""
          )}
          variant={status?.running ? "outline" : "default"}
        >
          {starting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : status?.running ? (
            <>
              <Square className="h-4 w-4" /> Stop Scanner
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Start Scanner
            </>
          )}
        </Button>
      </div>

      {/* Last scan error */}
      {status?.lastError && (
        <Card className="border-0 bg-red-500/10 ring-1 ring-red-500/30">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex-1 text-sm">
              <p className="font-medium text-red-400">Last scan failed</p>
              <p className="mt-1 text-xs text-red-300/80 font-mono break-all">{status.lastError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status card */}
      {status && !status.facebookConnected && (
        <Card className="border-0 bg-amber-500/10 ring-1 ring-amber-500/30">
          <CardContent className="flex items-center gap-3 p-4">
            <Globe className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-amber-400">Facebook not connected</p>
              <p className="text-amber-200/70">
                Go to{" "}
                <a href="/account" className="underline underline-offset-2">
                  Account
                </a>{" "}
                to log in so the scanner can browse Marketplace.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={cn("glass border-0", status?.running ? "ring-1 ring-emerald-500/30" : "")}>
        <CardContent className="flex items-center gap-4 p-6">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              status?.running ? "bg-emerald-500/20" : "bg-muted"
            )}
          >
            <div
              className={cn(
                "h-3 w-3 rounded-full",
                status?.running ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground"
              )}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {status?.running ? "Scanner Active" : "Scanner Offline"}
            </p>
            {status?.lastRun ? (
              <p className="text-xs text-muted-foreground">
                Last scan: {new Date(status.lastRun.startedAt).toLocaleString()} ·{" "}
                {status.lastRun.listingsScanned} listings scanned ·{" "}
                {status.lastRun.dealsFound} deals found
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No scans yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm sm:gap-2">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Active</span> Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className="text-lg font-bold sm:text-2xl">{status?.activeAlerts ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm sm:gap-2">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Deals</span> Found
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className="text-lg font-bold sm:text-2xl">{deals.length}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
            <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm sm:gap-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Best</span> Profit
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
            <p className="text-lg font-bold text-emerald-400 sm:text-2xl">
              ${deals.length > 0 ? Math.max(...deals.map((d) => d.profit)).toFixed(0) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deals feed */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Discovered Deals</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <Card className="glass border-0">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-lg font-medium">No deals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create alerts and start the scanner to find deals.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass border-0 transition-all hover:scale-[1.01]">
                  <CardContent className="flex gap-3 p-3 sm:gap-4 sm:p-4">
                    {deal.imageUrls?.[0] && (
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg sm:h-20 sm:w-20">
                        <img
                          src={deal.imageUrls[0]}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-tight line-clamp-2">{deal.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {deal.platform} · {deal.location || "Unknown location"}
                          </p>
                        </div>
                        <Badge
                          className={
                            deal.recommendation === "buy"
                              ? "shrink-0 bg-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs"
                              : "shrink-0 bg-red-500/20 text-red-400 text-[10px] sm:text-xs"
                          }
                        >
                          {deal.recommendation === "buy" ? "BUY" : "PASS"}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm">
                        <span>
                          Listed:{" "}
                          <span className="font-medium">${deal.price.toFixed(0)}</span>
                        </span>
                        <span>
                          Value:{" "}
                          <span className="font-medium">
                            ${deal.estimatedValue.toFixed(0)}
                          </span>
                        </span>
                        <span>
                          Profit:{" "}
                          <span className="font-medium text-emerald-400">
                            +${deal.profit.toFixed(0)}
                          </span>
                        </span>
                        <span>
                          Score:{" "}
                          <span className="font-medium">{deal.score}/100</span>
                        </span>
                      </div>
                      {deal.reason && (
                        <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                          {deal.reason}
                        </p>
                      )}
                      <div className="mt-2 flex gap-1">
                        {deal.listingUrl && (
                          <a href={deal.listingUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => toggleSaved(deal)}
                        >
                          <Bookmark
                            className={cn("h-3 w-3 sm:h-4 sm:w-4", deal.saved && "fill-primary text-primary")}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
