"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { usePageTitle } from "@/lib/usePageTitle"
import {
  Play,
  Square,
  Search,
  TrendingUp,
  Trophy,
  Bell,
  ExternalLink,
  Bookmark,
  Globe,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  condition?: string | null
}

interface ScanProgress {
  status: string
  currentKeyword: string | null
  keywordsDone: number
  keywordsTotal: number
  listingsFound: number
  dealsFound: number
  message: string
}

export default function DashboardPage() {
  usePageTitle("Scanner Dashboard")
  const [status, setStatus] = useState<ScannerStatus | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

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

    // SSE for scan progress
    const es = new EventSource("/api/scanner/progress")
    es.onmessage = (e) => {
      try {
        const p = JSON.parse(e.data) as ScanProgress
        setScanProgress(p)
        if (p.status === "completed" || p.status === "failed") {
          setTimeout(() => { es.close(); eventSourceRef.current = null; fetchData() }, 1000)
        }
      } catch { /* ignore parse errors */ }
    }
    es.onerror = () => { es.close() }
    eventSourceRef.current = es

    return () => { clearInterval(interval); es.close() }
  }, [])

  async function toggleScanner() {
    setStarting(true)
    try {
      const endpoint = status?.running ? "/api/scanner/stop" : "/api/scanner/start"
      const res = await fetch(endpoint, { method: "POST" })
      const data = await res.json().catch(() => ({}))
      if (data.setup) {
        toast("Scanner runs via GitHub Actions every 30 minutes", {
          description: data.setup.join("\n"),
          duration: 8000,
        })
      } else if (!res.ok) {
        toast.error(data.error || "Scanner request failed")
      }
    } catch (e: any) {
      toast.error(e.message || "Scanner error")
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
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold sm:text-xl">Scanner Dashboard</h1>
          <p className="text-xs text-muted-foreground">
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
        <div className="rounded-lg bg-red-500/10 ring-1 ring-red-500/30 px-3 py-2 text-xs">
          <p className="font-medium text-red-400">Last scan failed</p>
          <p className="mt-0.5 text-red-300/80 font-mono break-all">{status.lastError}</p>
        </div>
      )}

      {/* Status card */}
      {status && !status.facebookConnected && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/30 px-3 py-2 text-xs">
          <Globe className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="font-medium text-amber-400">Facebook not connected</p>
          <p className="text-amber-200/70 ml-1">
            Go to <a href="/account" className="underline underline-offset-2">Account</a> to log in.
          </p>
        </div>
      )}

      <Card className={cn("glass border-0", status?.running ? "ring-1 ring-emerald-500/30" : "")}>
        <CardContent className="flex items-center gap-3 p-4">
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

      {/* Scan progress */}
      {scanProgress && scanProgress.status === "running" && (
        <div className="rounded-lg bg-blue-500/10 ring-1 ring-blue-500/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin shrink-0" />
            <p className="text-xs font-medium text-blue-400 flex-1">{scanProgress.message}</p>
            <span className="text-[10px] text-blue-300/70">{scanProgress.keywordsDone}/{scanProgress.keywordsTotal} kw</span>
            <span className="text-[10px] text-blue-300/70">{scanProgress.listingsFound} listings</span>
            <span className="text-[10px] text-blue-300/70">{scanProgress.dealsFound} deals</span>
          </div>
          {scanProgress.keywordsTotal > 0 && (
            <div className="mt-1.5 h-1 bg-blue-950 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(scanProgress.keywordsDone / scanProgress.keywordsTotal) * 100}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass rounded-lg px-3 py-2.5 border-0">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Bell className="h-3 w-3" /> Alerts</p>
          <p className="text-lg font-bold">{status?.activeAlerts ?? 0}</p>
        </div>
        <div className="glass rounded-lg px-3 py-2.5 border-0">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Trophy className="h-3 w-3" /> Deals</p>
          <p className="text-lg font-bold">{status?.totalDeals ?? 0}</p>
        </div>
        <div className="glass rounded-lg px-3 py-2.5 border-0 transition-colors hover:bg-accent/50 cursor-pointer" onClick={() => {
          const best = deals.reduce((a, b) => a.profit > b.profit ? a : b, deals[0])
          if (best) setSelectedDeal(best)
        }}>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Best Profit</p>
          <p className="text-lg font-bold text-emerald-400">${deals.length > 0 ? Math.max(...deals.map((d) => d.profit)).toFixed(0) : 0}</p>
        </div>
      </div>

      {/* Deals feed */}
      <div>
        <h2 className="mb-2 text-sm font-semibold">Discovered Deals</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <Card className="glass border-0">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Search className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">No deals yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Create alerts and start the scanner to find deals.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-1.5">
            {deals.map((deal) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Dialog open={selectedDeal?.id === deal.id} onOpenChange={(o) => { if (!o) setSelectedDeal(null) }}>
                  <Card className="glass border-0 cursor-pointer" onClick={() => setSelectedDeal(deal)}>
                    <CardContent className="flex gap-2 p-2.5">
                      {deal.imageUrls?.[0] && (
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <img src={deal.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-medium leading-tight line-clamp-1">{deal.title}</p>
                          <Badge className={cn(
                            "shrink-0 text-[9px] px-1.5 py-0",
                            deal.recommendation === "buy"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          )}>
                            {deal.recommendation === "buy" ? "BUY" : "PASS"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className="font-medium">${deal.price.toFixed(0)}</span>
                          <span className="text-muted-foreground">→ ${deal.estimatedValue.toFixed(0)}</span>
                          <span className="font-medium text-emerald-400">+${deal.profit.toFixed(0)}</span>
                          <span className="text-muted-foreground">{deal.score}/100</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {deal.listingUrl && (
                            <a href={deal.listingUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                          <Button variant="ghost" size="icon" className="h-6 w-6"
                            onClick={(e) => { e.stopPropagation(); toggleSaved(deal) }}>
                            <Bookmark className={cn("h-3 w-3", deal.saved && "fill-primary text-primary")} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deal detail dialog */}
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-sm truncate pr-6">{deal.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div><span className="text-muted-foreground">Price</span><p className="font-medium">${deal.price.toLocaleString()}</p></div>
                        <div><span className="text-muted-foreground">Resale</span><p className="font-medium">${deal.estimatedValue.toLocaleString()}</p></div>
                        <div><span className="text-muted-foreground">Profit</span><p className={`font-medium ${deal.profit > 0 ? "text-green-500" : "text-red-500"}`}>${deal.profit.toLocaleString()}</p></div>
                        <div><span className="text-muted-foreground">Score</span><p className={`font-medium ${deal.score >= 70 ? "text-green-500" : deal.score >= 40 ? "text-yellow-500" : "text-red-500"}`}>{deal.score}/100</p></div>
                        <div><span className="text-muted-foreground">Condition</span><p className="font-medium">{deal.condition || "Unknown"}</p></div>
                        <div><span className="text-muted-foreground">Platform</span><p className="font-medium capitalize">{deal.platform || "Facebook"}</p></div>
                      </div>
                      {deal.reason && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{deal.reason}</p>
                      )}
                      {deal.listingUrl && (
                        <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={() => window.open(deal.listingUrl!, "_blank")}>
                          <ExternalLink className="mr-1 h-3 w-3" /> Open Listing
                        </Button>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
