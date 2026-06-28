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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ScannerStatus {
  running: boolean
  lastRun: { startedAt: string; listingsScanned: number; dealsFound: number } | null
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
    const [statusRes, dealsRes] = await Promise.all([
      fetch("/api/scanner/status"),
      fetch("/api/deals"),
    ])
    if (statusRes.ok) setStatus(await statusRes.json())
    if (dealsRes.ok) setDeals(await dealsRes.json())
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  async function toggleScanner() {
    setStarting(true)
    const endpoint = status?.running ? "/api/scanner/stop" : "/api/scanner/start"
    await fetch(endpoint, { method: "POST" })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scanner Dashboard</h1>
          <p className="text-muted-foreground">
            {status?.running
              ? "Scanner is running — checking for deals every 30 min"
              : "Scanner is stopped"}
          </p>
        </div>
        <Button
          onClick={toggleScanner}
          disabled={starting}
          className={cn(
            "gap-2",
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

      {/* Status card */}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Bell className="h-4 w-4" /> Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{status?.activeAlerts ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Search className="h-4 w-4" /> Deals Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{deals.length}</p>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" /> Best Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">
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
                  <CardContent className="flex gap-4 p-4">
                    {deal.imageUrls?.[0] && (
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
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
                          <p className="truncate text-sm font-medium">{deal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {deal.platform} · {deal.location || "Unknown location"}
                          </p>
                        </div>
                        <Badge
                          className={
                            deal.recommendation === "buy"
                              ? "shrink-0 bg-emerald-500/20 text-emerald-400"
                              : "shrink-0 bg-red-500/20 text-red-400"
                          }
                        >
                          {deal.recommendation === "buy" ? "BUY" : "PASS"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {deal.reason}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      {deal.listingUrl && (
                        <a
                          href={deal.listingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleSaved(deal)}
                      >
                        <Bookmark
                          className={cn("h-4 w-4", deal.saved && "fill-primary text-primary")}
                        />
                      </Button>
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
