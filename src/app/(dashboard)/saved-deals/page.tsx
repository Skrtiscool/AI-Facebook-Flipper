"use client"

import { useEffect, useState } from "react"
import {
  Bookmark, Search, Download, Trash2, MessageCircle, DollarSign,
  ChevronDown, Plus, X, TrendingUp, TrendingDown, Clock,
  Package, CheckCircle2, Ban,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface Deal {
  id: string
  title: string
  price: number
  estimatedValue: number
  profit: number
  score: number
  recommendation: string
  reason: string | null
  confidence: number
  platform: string | null
  listingUrl: string | null
  imageUrls: string[]
  location: string | null
  condition: string | null
  scannedAt: string
  read: boolean
  saved: boolean
  notes: string | null
  category: string | null
  status: string
  shippingCost: number | null
  fees: number | null
  actualProfit: number | null
  scanCount: number
  lastPriceDrop: string | null
  priceHistory: { price: number; date: string }[] | null
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  watching: <TrendingUp className="h-3.5 w-3.5" />,
  messaged: <MessageCircle className="h-3.5 w-3.5" />,
  bought: <DollarSign className="h-3.5 w-3.5" />,
  listed: <Package className="h-3.5 w-3.5" />,
  sold: <CheckCircle2 className="h-3.5 w-3.5" />,
  passed: <Ban className="h-3.5 w-3.5" />,
}

const STATUS_COLORS: Record<string, string> = {
  watching: "bg-blue-500/10 text-blue-500",
  messaged: "bg-yellow-500/10 text-yellow-500",
  bought: "bg-orange-500/10 text-orange-500",
  listed: "bg-purple-500/10 text-purple-500",
  sold: "bg-green-500/10 text-green-500",
  passed: "bg-gray-500/10 text-gray-500",
}

const CATEGORIES = [
  "Electronics", "Tools", "Vehicles", "Furniture", "Clothing",
  "Toys", "Sports", "Collectibles", "Home", "Other",
]

export default function SavedDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [showProfitCalc, setShowProfitCalc] = useState(false)
  const [shippingCost, setShippingCost] = useState("")
  const [fees, setFees] = useState("")
  const [actualSalePrice, setActualSalePrice] = useState("")

  useEffect(() => { loadDeals() }, [])

  async function loadDeals() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterCategory !== "all") params.set("category", filterCategory)
      const res = await fetch(`/api/deals?${params}`)
      if (res.ok) setDeals(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDeals() }, [filterStatus, filterCategory])

  async function updateDeal(id: string, data: Record<string, unknown>) {
    await fetch("/api/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    loadDeals()
  }

  async function deleteDeal(id: string) {
    await fetch("/api/deals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setSelectedDeal(null)
    loadDeals()
  }

  function exportCSV() {
    const headers = ["Title", "Price", "Est. Value", "Profit", "Score", "Status", "Category", "Notes", "URL", "Found"]
    const rows = deals.map(d => [
      `"${d.title}"`, d.price, d.estimatedValue, d.profit, d.score,
      d.status, d.category || "", `"${(d.notes || "").replace(/"/g, '""')}"`,
      d.listingUrl || "", new Date(d.scannedAt).toLocaleDateString(),
    ])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `flipscout-deals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  const filtered = deals.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === "all" || d.status === filterStatus) &&
    (filterCategory === "all" || d.category === filterCategory)
  )

  const profitCalc = actualSalePrice
    ? (parseFloat(actualSalePrice || "0") - parseFloat(shippingCost || "0") - parseFloat(fees || "0"))
    : null

  const statuses = ["watching", "messaged", "bought", "listed", "sold", "passed"]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground">{deals.length} deals tracked</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={!!selectedDeal} onOpenChange={(o) => { if (!o) setSelectedDeal(null) }}>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="mr-1 h-3.5 w-3.5" /> CSV
            </Button>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search deals..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => v && setFilterStatus(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={(v) => v && setFilterCategory(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="glass border-0">
          <CardContent className="flex flex-col items-center py-16">
            <Bookmark className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No deals found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((deal) => (
            <Dialog key={deal.id} open={selectedDeal?.id === deal.id} onOpenChange={(o) => {
              if (o) { setSelectedDeal(deal); setEditNotes(deal.notes || ""); setShowProfitCalc(false) }
              else setSelectedDeal(null)
            }}>
              <Card className="glass border-0 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => { setSelectedDeal(deal); setEditNotes(deal.notes || ""); setShowProfitCalc(false) }}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {deal.imageUrls?.[0] && (
                        <img src={deal.imageUrls[0]} alt="" className="h-16 w-16 rounded-lg object-cover shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">{deal.title}</span>
                          <Badge variant="outline" className={`shrink-0 ${STATUS_COLORS[deal.status]}`}>
                            {STATUS_ICONS[deal.status]} <span className="ml-1 capitalize">{deal.status}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span>${deal.price.toLocaleString()}</span>
                          <span>Est: ${deal.estimatedValue.toLocaleString()}</span>
                          <span className={deal.profit > 0 ? "text-green-500" : "text-red-500"}>
                            {deal.profit > 0 ? "+" : ""}${deal.profit.toLocaleString()}
                          </span>
                          <span className={
                            deal.score >= 70 ? "text-green-500" : deal.score >= 40 ? "text-yellow-500" : "text-red-500"
                          }>Score: {deal.score}</span>
                          {deal.category && <span className="text-muted-foreground">{deal.category}</span>}
                          {deal.lastPriceDrop && <span className="text-orange-500 flex items-center gap-1">
                            <TrendingDown className="h-3 w-3" /> Price dropped
                          </span>}
                          {deal.scanCount > 1 && <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Seen {deal.scanCount}x
                          </span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); updateDeal(deal.id, { saved: !deal.saved }) }}>
                          <Bookmark className={`h-4 w-4 ${deal.saved ? "fill-primary text-primary" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="pr-8">{deal.title}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="profit">Profit</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Price</span><p className="font-semibold">${deal.price.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">Est. Resale</span><p className="font-semibold">${deal.estimatedValue.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">Profit</span><p className={`font-semibold ${deal.profit > 0 ? "text-green-500" : "text-red-500"}`}>${deal.profit.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">Score</span><p className={`font-semibold ${deal.score >= 70 ? "text-green-500" : deal.score >= 40 ? "text-yellow-500" : "text-red-500"}`}>{deal.score}/100</p></div>
                      <div><span className="text-muted-foreground">Condition</span><p>{deal.condition || "Unknown"}</p></div>
                      <div><span className="text-muted-foreground">Platform</span><p className="capitalize">{deal.platform || "Facebook"}</p></div>
                      <div><span className="text-muted-foreground">Location</span><p>{deal.location || "N/A"}</p></div>
                      <div><span className="text-muted-foreground">Scanned</span><p>{new Date(deal.scannedAt).toLocaleString()}</p></div>
                    </div>
                    {deal.reason && (
                      <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{deal.reason}</div>
                    )}
                    {deal.listingUrl && (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(deal.listingUrl!, "_blank")}>
                        Open Listing
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={() => deleteDeal(deal.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tracking" className="space-y-4">
                    <div>
                      <Label>Status</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {statuses.map(s => (
                          <Button key={s} variant={deal.status === s ? "default" : "outline"} size="sm"
                            className="capitalize" onClick={() => updateDeal(deal.id, { status: s })}>
                            {STATUS_ICONS[s]} <span className="ml-1">{s}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Category</Label>
                      <Select value={deal.category || ""} onValueChange={(v) => v && updateDeal(deal.id, { category: v })}>
                        <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant={deal.saved ? "default" : "outline"} size="sm" onClick={() => updateDeal(deal.id, { saved: !deal.saved })}>
                        <Bookmark className={`mr-1 h-4 w-4 ${deal.saved ? "fill-current" : ""}`} /> {deal.saved ? "Saved" : "Save"}
                      </Button>
                      <Button variant={deal.read ? "outline" : "default"} size="sm" onClick={() => updateDeal(deal.id, { read: !deal.read })}>
                        {deal.read ? "Mark unread" : "Mark read"}
                      </Button>
                    </div>

                    {deal.lastPriceDrop && (
                      <div className="bg-orange-500/10 text-orange-600 rounded-lg p-3 text-sm flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" /> Price dropped on {new Date(deal.lastPriceDrop).toLocaleDateString()}
                      </div>
                    )}
                    {deal.scanCount > 1 && (
                      <div className="text-sm text-muted-foreground">Seen in {deal.scanCount} scans</div>
                    )}
                  </TabsContent>

                  <TabsContent value="profit" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Listing Price</span><p className="font-semibold">${deal.price.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">Est. Resale</span><p className="font-semibold">${deal.estimatedValue.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">Est. Profit</span><p className="font-semibold text-green-500">${deal.profit.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground">Confidence</span><p className="font-semibold">{Math.round(deal.confidence * 100)}%</p></div>
                    </div>

                    {deal.shippingCost !== null && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between"><span>Shipping</span><span>-${deal.shippingCost?.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Fees</span><span>-${deal.fees?.toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                          <span>Net Profit</span>
                          <span className={deal.actualProfit && deal.actualProfit > 0 ? "text-green-500" : "text-red-500"}>
                            ${deal.actualProfit?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}

                    <Dialog open={showProfitCalc} onOpenChange={setShowProfitCalc}>
                      <Button variant="outline" size="sm" className="w-full" onClick={() => setShowProfitCalc(true)}>
                        <DollarSign className="mr-1 h-4 w-4" /> Calculate Actual Profit
                      </Button>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Profit Calculator</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>What did you sell it for?</Label>
                            <Input type="number" placeholder={String(deal.estimatedValue)} value={actualSalePrice} onChange={e => setActualSalePrice(e.target.value)} />
                          </div>
                          <div>
                            <Label>Shipping cost</Label>
                            <Input type="number" placeholder="0" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
                          </div>
                          <div>
                            <Label>Platform fees / other costs</Label>
                            <Input type="number" placeholder="0" value={fees} onChange={e => setFees(e.target.value)} />
                          </div>
                          {profitCalc !== null && (
                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Sale Price</span><span>${parseFloat(actualSalePrice || "0").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Shipping</span><span>-${parseFloat(shippingCost || "0").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Fees</span><span>-${parseFloat(fees || "0").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-2">
                                <span>Net Profit</span>
                                <span className={profitCalc > 0 ? "text-green-500" : "text-red-500"}>
                                  ${profitCalc.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                          <Button className="w-full" onClick={() => {
                            updateDeal(deal.id, {
                              shippingCost: parseFloat(shippingCost || "0"),
                              fees: parseFloat(fees || "0"),
                              actualProfit: profitCalc,
                            })
                            setShowProfitCalc(false)
                          }}>
                            Save Actual Profit
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <Textarea
                      placeholder="Add notes about this deal..."
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      rows={5}
                    />
                    <Button className="w-full" onClick={() => {
                      updateDeal(deal.id, { notes: editNotes })
                      setSelectedDeal(null)
                    }}>
                      Save Notes
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  )
}
