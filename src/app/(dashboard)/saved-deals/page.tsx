"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Bookmark, Search, Download, Trash2, MessageCircle, DollarSign,
  ChevronDown, Plus, X, TrendingUp, TrendingDown, Clock,
  Package, CheckCircle2, Ban, LayoutGrid, List, Tags,
  Filter, Save, Undo2, AlertCircle, History, Target, Check,
  GripVertical,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DealTag {
  id: string
  name: string
  color: string
}

interface DealActivity {
  id: string
  type: string
  message: string
  metadata: any
  createdAt: string
}

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
  offerAmount: number | null
  offerDate: string | null
  sellerResponse: string | null
  expectedSalePrice: number | null
  dateBought: string | null
  dateSold: string | null
  storageLocation: string | null
  costBasis: number | null
  roi: number | null
  daysInInventory: number | null
  dealTags: { tag: DealTag }[]
  activities: DealActivity[]
}

interface TagItem {
  id: string
  name: string
  color: string
  _count?: { dealTags: number }
}

interface SavedFilter {
  id: string
  name: string
  filters: string
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  watching: <TrendingUp className="h-3 w-3" />,
  messaged: <MessageCircle className="h-3 w-3" />,
  bought: <DollarSign className="h-3 w-3" />,
  listed: <Package className="h-3 w-3" />,
  sold: <CheckCircle2 className="h-3 w-3" />,
  passed: <Ban className="h-3 w-3" />,
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

const STATUSES = ["watching", "messaged", "bought", "listed", "sold", "passed"]

export default function SavedDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([])
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
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchMode, setBatchMode] = useState(false)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickForm, setQuickForm] = useState({ title: "", price: "", url: "", category: "" })
  const [tags, setTags] = useState<TagItem[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showSaveFilter, setShowSaveFilter] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [undoStack, setUndoStack] = useState<{ id: string; prev: Record<string, any> }[]>([])
  const [toast, setToast] = useState<{ message: string; dealId?: string; prev?: Record<string, any> } | null>(null)

  const loadDeals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterCategory !== "all") params.set("category", filterCategory)
      const [dealsRes, tagsRes, filtersRes] = await Promise.all([
        fetch(`/api/deals?${params}`),
        fetch("/api/tags"),
        fetch("/api/filters"),
      ])
      if (dealsRes.ok) { const d = await dealsRes.json(); setDeals(d); setAllDeals(d) }
      if (tagsRes.ok) setTags(await tagsRes.json())
      if (filtersRes.ok) setSavedFilters(await filtersRes.json())
    } finally {
      setLoading(false)
    }
  }, [filterStatus, filterCategory])

  useEffect(() => { loadDeals() }, [loadDeals])

  useEffect(() => {
    if (filterStatus === "all" && filterCategory === "all") return
    loadDeals()
  }, [filterStatus, filterCategory, loadDeals])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (selectedDeal) {
        const idx = STATUSES.indexOf(selectedDeal.status)
        if (e.key >= "1" && e.key <= "6") {
          const s = STATUSES[parseInt(e.key) - 1]
          if (s) updateDeal(selectedDeal.id, { status: s })
        }
        if (e.key === "s" || e.key === "S") updateDeal(selectedDeal.id, { saved: !selectedDeal.saved })
        if (e.key === "m" || e.key === "M") updateDeal(selectedDeal.id, { status: "messaged" })
        if (e.key === "b" || e.key === "B") updateDeal(selectedDeal.id, { status: "bought" })
        if (e.key === "Delete" || e.key === "Backspace") deleteDeal(selectedDeal.id)
      }
      if (e.key === "n" || e.key === "N") setShowQuickAdd(true)
      if (e.key === "v" || e.key === "V") setViewMode(v => v === "list" ? "kanban" : "list")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [selectedDeal])

  async function updateDeal(id: string, data: Record<string, unknown>) {
    const prev = allDeals.find(d => d.id === id)
    await fetch("/api/deals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    })
    setUndoStack(s => [...s.slice(-19), { id, prev: prev ? { status: prev.status, saved: prev.saved, category: prev.category } : {} }])
    showToast(`Updated ${data.status ? `status → ${data.status}` : "deal"}`, id, prev ? { status: prev.status, saved: prev.saved, category: prev.category } : undefined)
    loadDeals()
  }

  async function deleteDeal(id: string) {
    await fetch("/api/deals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    setSelectedDeal(null)
    showToast("Deal deleted")
    loadDeals()
  }

  async function undoLast() {
    const last = undoStack.pop()
    if (!last) return
    setUndoStack([...undoStack])
    await updateDeal(last.id, last.prev)
    showToast("Undone")
  }

  function showToast(message: string, dealId?: string, prev?: Record<string, any>) {
    setToast({ message, dealId, prev })
    setTimeout(() => setToast(null), 4000)
  }

  async function batchUpdate(data: Record<string, unknown>) {
    if (selectedIds.size === 0) return
    await fetch("/api/deals/batch", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedIds), ...data }),
    })
    showToast(`Updated ${selectedIds.size} deals`)
    setSelectedIds(new Set())
    setBatchMode(false)
    loadDeals()
  }

  async function batchDelete() {
    if (selectedIds.size === 0) return
    for (const id of selectedIds) {
      await fetch("/api/deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    }
    showToast(`Deleted ${selectedIds.size} deals`)
    setSelectedIds(new Set())
    setBatchMode(false)
    loadDeals()
  }

  function toggleSelect(id: string) {
    setSelectedIds(s => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  async function saveFilter() {
    await fetch("/api/filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: filterName,
        filters: { status: filterStatus, category: filterCategory, search },
      }),
    })
    setShowSaveFilter(false)
    setFilterName("")
    loadDeals()
  }

  function applyFilter(f: SavedFilter) {
    const filt = JSON.parse(f.filters)
    setFilterStatus(filt.status || "all")
    setFilterCategory(filt.category || "all")
    setSearch(filt.search || "")
  }

  async function deleteFilter(id: string) {
    await fetch(`/api/filters/${id}`, { method: "DELETE" })
    loadDeals()
  }

  async function toggleTag(dealId: string, tagId: string) {
    const deal = allDeals.find(d => d.id === dealId)
    const has = deal?.dealTags?.some(dt => dt.tag.id === tagId)
    if (has) {
      await fetch("/api/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, removeTagId: tagId }),
      })
    } else {
      await fetch("/api/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dealId, addTagId: tagId }),
      })
    }
    loadDeals()
  }

  async function createTag(name: string) {
    await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    loadDeals()
  }

  function exportCSV() {
    const headers = ["Title", "Price", "Est. Value", "Profit", "Score", "Status", "Category", "Tags", "Notes", "URL", "Found", "Offer", "Bought", "Sold", "Storage"]
    const rows = deals.map(d => [
      `"${d.title}"`, d.price, d.estimatedValue, d.profit, d.score,
      d.status, d.category || "", (d.dealTags || []).map(dt => dt.tag.name).join("; "),
      `"${(d.notes || "").replace(/"/g, '""')}"`,
      d.listingUrl || "", new Date(d.scannedAt).toLocaleDateString(),
      d.offerAmount || "", d.dateBought ? new Date(d.dateBought).toLocaleDateString() : "",
      d.dateSold ? new Date(d.dateSold).toLocaleDateString() : "", d.storageLocation || "",
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

  const kanbanColumns = STATUSES.map(s => ({
    status: s,
    deals: filtered.filter(d => d.status === s),
  }))

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-popover border rounded-lg shadow-lg px-4 py-3 text-sm animate-in slide-in-from-right">
          <AlertCircle className="h-4 w-4 text-primary" />
          <span>{toast.message}</span>
          {toast.prev && (
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => { undoLast(); setToast(null) }}>
              <Undo2 className="h-3 w-3 mr-1" /> Undo
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setToast(null)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Deal Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {deals.length} deals · <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">N</kbd> quick add · <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">V</kbd> toggle view
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(v => v === "list" ? "kanban" : "list")}>
            {viewMode === "list" ? <LayoutGrid className="mr-1 h-3.5 w-3.5" /> : <List className="mr-1 h-3.5 w-3.5" />}
            {viewMode === "list" ? "Board" : "List"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBatchMode(!batchMode)}>
            <Check className="mr-1 h-3.5 w-3.5" /> Batch
          </Button>
          <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
            <Button variant="default" size="sm" onClick={() => setShowQuickAdd(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Deal
            </Button>
            <DialogContent>
              <DialogHeader><DialogTitle>Quick Add Deal</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Title *</Label><Input value={quickForm.title} onChange={e => setQuickForm({ ...quickForm, title: e.target.value })} /></div>
                <div><Label>Price *</Label><Input type="number" value={quickForm.price} onChange={e => setQuickForm({ ...quickForm, price: e.target.value })} /></div>
                <div><Label>Listing URL</Label><Input value={quickForm.url} onChange={e => setQuickForm({ ...quickForm, url: e.target.value })} /></div>
                <div><Label>Category</Label>
                  <Select value={quickForm.category} onValueChange={v => v !== null && setQuickForm({ ...quickForm, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={async () => {
                  if (!quickForm.title || !quickForm.price) return
                  await fetch("/api/deals/quick", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(quickForm),
                  })
                  setShowQuickAdd(false)
                  setQuickForm({ title: "", price: "", url: "", category: "" })
                  loadDeals()
                  showToast("Deal added")
                }}>Add Deal</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-1 h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterStatus} onValueChange={v => v && setFilterStatus(v)}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={v => v && setFilterCategory(v)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Dialog open={showSaveFilter} onOpenChange={setShowSaveFilter}>
          <Button variant="ghost" size="sm" onClick={() => setShowSaveFilter(true)}>
            <Save className="mr-1 h-3.5 w-3.5" /> Save Filter
          </Button>
          <DialogContent>
            <DialogHeader><DialogTitle>Save Filter Preset</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="e.g. High profit tools" /></div>
              <Button className="w-full" onClick={saveFilter}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
        {savedFilters.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {savedFilters.map(f => (
              <Badge key={f.id} variant="outline" className="cursor-pointer gap-1" onClick={() => applyFilter(f)}>
                <Filter className="h-3 w-3" /> {f.name}
                <X className="h-3 w-3 ml-1 hover:text-destructive" onClick={e => { e.stopPropagation(); deleteFilter(f.id) }} />
              </Badge>
            ))}
          </div>
        )}
        {(filterStatus !== "all" || filterCategory !== "all" || search) && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterStatus("all"); setFilterCategory("all"); setSearch("") }}>
            Clear
          </Button>
        )}
      </div>

      {/* Batch action bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Select onValueChange={v => v && batchUpdate({ status: v })}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Set status" /></SelectTrigger>
            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
          <Select onValueChange={v => v && batchUpdate({ category: v })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Set category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="destructive" size="sm" onClick={batchDelete}>
            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setSelectedIds(new Set()); setBatchMode(false) }}>
            Cancel
          </Button>
        </div>
      )}

      {/* Tags bar */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <Tags className="h-3.5 w-3.5 text-muted-foreground" />
          {tags.map(t => (
            <Badge key={t.id} variant="outline" style={{ borderColor: t.color, color: t.color }}>
              {t.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <Card className="glass border-0">
          <CardContent className="flex flex-col items-center py-16">
            <Bookmark className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No deals found</p>
            <p className="text-sm text-muted-foreground mt-1">Press <kbd className="px-1 bg-muted rounded">N</kbd> to add one</p>
          </CardContent>
        </Card>
      ) : viewMode === "kanban" ? (
        /* Kanban Board */
        <div className="grid grid-cols-6 gap-3 overflow-x-auto">
          {kanbanColumns.map(col => (
            <div key={col.status} className="min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={STATUS_COLORS[col.status]}>
                  {STATUS_ICONS[col.status]} <span className="ml-1 capitalize">{col.status}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">{col.deals.length}</span>
              </div>
              <div className="space-y-2">
                {col.deals.map(deal => (
                  <Card key={deal.id} className="glass border-0 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => { setSelectedDeal(deal); setEditNotes(deal.notes || ""); setShowProfitCalc(false) }}>
                    <CardContent className="p-3">
                      {batchMode && (
                        <input type="checkbox" checked={selectedIds.has(deal.id)} onChange={() => toggleSelect(deal.id)}
                          className="mb-2" onClick={e => e.stopPropagation()} />
                      )}
                      {deal.imageUrls?.[0] && (
                        <img src={deal.imageUrls[0]} alt="" className="w-full h-24 rounded object-cover mb-2"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                      )}
                      <p className="text-xs font-medium leading-tight line-clamp-2 mb-1">{deal.title}</p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="font-semibold">${deal.price.toLocaleString()}</span>
                        <span className={deal.profit > 0 ? "text-green-500" : "text-red-500"}>
                          {deal.profit > 0 ? "+" : ""}${deal.profit.toLocaleString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filtered.map((deal) => (
            <Dialog key={deal.id} open={selectedDeal?.id === deal.id} onOpenChange={(o) => {
              if (o) { setSelectedDeal(deal); setEditNotes(deal.notes || ""); setShowProfitCalc(false) }
              else setSelectedDeal(null)
            }}>
              <Card className={cn(
                "glass border-0 cursor-pointer hover:bg-accent/50 transition-colors",
                batchMode && selectedIds.has(deal.id) && "ring-2 ring-primary"
              )}>
                <CardContent className="p-3 sm:p-4" onClick={() => {
                  if (batchMode) { toggleSelect(deal.id); return }
                  setSelectedDeal(deal); setEditNotes(deal.notes || ""); setShowProfitCalc(false)
                }}>
                  <div className="flex items-start gap-3 sm:gap-4">
                    {batchMode && (
                      <div className="pt-2" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(deal.id)} onChange={() => toggleSelect(deal.id)} />
                      </div>
                    )}
                    {deal.imageUrls?.[0] && (
                      <img src={deal.imageUrls[0]} alt="" className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none" }} />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">{deal.title}</span>
                        <Badge variant="outline" className={cn("shrink-0 text-[10px] sm:text-xs", STATUS_COLORS[deal.status])}>
                          {STATUS_ICONS[deal.status]} <span className="ml-1 capitalize hidden sm:inline">{deal.status}</span>
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">${deal.price.toLocaleString()}</span>
                        <span>Est: ${deal.estimatedValue.toLocaleString()}</span>
                        <span className={deal.profit > 0 ? "text-green-500" : "text-red-500"}>
                          {deal.profit > 0 ? "+" : ""}${deal.profit.toLocaleString()}
                        </span>
                        <span className={deal.score >= 70 ? "text-green-500" : deal.score >= 40 ? "text-yellow-500" : "text-red-500"}>
                          Score: {deal.score}
                        </span>
                        {deal.category && <span>{deal.category}</span>}
                        {deal.lastPriceDrop && <span className="text-orange-500 flex items-center gap-1">
                          <TrendingDown className="h-3 w-3" /> Price dropped
                        </span>}
                        {deal.dealTags?.map(dt => (
                          <span key={dt.tag.id} className="text-[10px]" style={{ color: dt.tag.color }}>
                            #{dt.tag.name}
                          </span>
                        ))}
                      </div>
                      {/* Quick actions */}
                      <div className="flex gap-1 mt-2" onClick={e => e.stopPropagation()}>
                        {["messaged", "bought", "sold", "passed"].map(s => (
                          <Button key={s} variant={deal.status === s ? "default" : "ghost"} size="sm"
                            className={cn("h-7 px-2 text-[10px]", deal.status !== s && "opacity-40 hover:opacity-100")}
                            onClick={() => updateDeal(deal.id, { status: s })}>
                            {STATUS_ICONS[s]}
                            <span className="ml-1 hidden sm:inline capitalize">{s}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={(e) => { e.stopPropagation(); updateDeal(deal.id, { saved: !deal.saved }) }}>
                        <Bookmark className={cn("h-3.5 w-3.5", deal.saved && "fill-primary text-primary")} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deal Dialog */}
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-2 pr-8">
                    <DialogTitle className="text-base truncate">{deal.title}</DialogTitle>
                    {deal.dealTags?.map(dt => (
                      <span key={dt.tag.id} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dt.tag.color + "20", color: dt.tag.color }}>
                        {dt.tag.name}
                      </span>
                    ))}
                  </div>
                </DialogHeader>

                <Tabs defaultValue="details">
                  <TabsList className="grid grid-cols-5 text-xs">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="tracking">Pipeline</TabsTrigger>
                    <TabsTrigger value="profit">Profit</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground text-xs">Price</span><p className="font-semibold">${deal.price.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Est. Resale</span><p className="font-semibold">${deal.estimatedValue.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Profit</span><p className={`font-semibold ${deal.profit > 0 ? "text-green-500" : "text-red-500"}`}>${deal.profit.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Score</span><p className={`font-semibold ${deal.score >= 70 ? "text-green-500" : deal.score >= 40 ? "text-yellow-500" : "text-red-500"}`}>{deal.score}/100</p></div>
                      <div><span className="text-muted-foreground text-xs">Condition</span><p>{deal.condition || "Unknown"}</p></div>
                      <div><span className="text-muted-foreground text-xs">Platform</span><p className="capitalize">{deal.platform || "Facebook"}</p></div>
                      <div><span className="text-muted-foreground text-xs">Location</span><p>{deal.location || "N/A"}</p></div>
                      <div><span className="text-muted-foreground text-xs">Scanned</span><p>{new Date(deal.scannedAt).toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Scan Count</span><p>{deal.scanCount}x</p></div>
                      {deal.storageLocation && <div><span className="text-muted-foreground text-xs">Storage</span><p>{deal.storageLocation}</p></div>}
                    </div>
                    {deal.reason && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">{deal.reason}</div>
                    )}
                    {deal.listingUrl && (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(deal.listingUrl!, "_blank")}>
                        Open Listing
                      </Button>
                    )}
                    {/* Tags */}
                    <div>
                      <Label className="text-xs">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tags.map(t => (
                          <Badge key={t.id} variant="outline" className={cn(
                            "cursor-pointer text-xs",
                            deal.dealTags?.some(dt => dt.tag.id === t.id) && "ring-2"
                          )}
                            style={{ borderColor: t.color, color: t.color }}
                            onClick={() => toggleTag(deal.id, t.id)}>
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Input placeholder="New tag..." className="h-7 text-xs"
                          onKeyDown={e => { if (e.key === "Enter" && e.currentTarget.value) { createTag(e.currentTarget.value); e.currentTarget.value = "" } }} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={() => deleteDeal(deal.id)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete <kbd className="ml-1 text-[10px] opacity-60">⌫</kbd>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tracking" className="space-y-4">
                    <div>
                      <Label className="text-xs">Status <kbd className="ml-1 text-[10px] opacity-60">1-6</kbd></Label>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {STATUSES.map((s, i) => (
                          <Button key={s} variant={deal.status === s ? "default" : "outline"} size="sm"
                            className="capitalize text-xs h-8" onClick={() => updateDeal(deal.id, { status: s })}>
                            {STATUS_ICONS[s]} <span className="ml-1">{s}</span>
                            <span className="ml-1 text-[10px] opacity-40">{i + 1}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Category</Label>
                      <Select value={deal.category || ""} onValueChange={v => v && updateDeal(deal.id, { category: v })}>
                        <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Offer tracking */}
                    <div className="border rounded-lg p-3 space-y-3">
                      <Label className="text-xs font-semibold flex items-center gap-1">
                        <Target className="h-3 w-3" /> Offer Tracking
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-[10px]">Offer Amount</Label>
                          <Input type="number" className="h-8 text-xs" placeholder="$" value={deal.offerAmount ?? ""}
                            onChange={e => updateDeal(deal.id, { offerAmount: e.target.value ? parseFloat(e.target.value) : null })} />
                        </div>
                        <div><Label className="text-[10px]">Expected Sale</Label>
                          <Input type="number" className="h-8 text-xs" placeholder="$" value={deal.expectedSalePrice ?? ""}
                            onChange={e => updateDeal(deal.id, { expectedSalePrice: e.target.value ? parseFloat(e.target.value) : null })} />
                        </div>
                        <div><Label className="text-[10px]">Seller Response</Label>
                          <Select value={deal.sellerResponse || ""} onValueChange={v => updateDeal(deal.id, { sellerResponse: v || null })}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Response" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="countered">Countered</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="no_reply">No Reply</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div><Label className="text-[10px]">Storage Location</Label>
                          <Input className="h-8 text-xs" placeholder="e.g. Garage shelf B" value={deal.storageLocation ?? ""}
                            onChange={e => updateDeal(deal.id, { storageLocation: e.target.value || null })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div><Label className="text-[10px]">Date Bought</Label>
                          <Input type="date" className="h-8 text-xs" value={deal.dateBought?.slice(0, 10) ?? ""}
                            onChange={e => updateDeal(deal.id, { dateBought: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                        </div>
                        <div><Label className="text-[10px]">Date Sold</Label>
                          <Input type="date" className="h-8 text-xs" value={deal.dateSold?.slice(0, 10) ?? ""}
                            onChange={e => updateDeal(deal.id, { dateSold: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant={deal.saved ? "default" : "outline"} size="sm" onClick={() => updateDeal(deal.id, { saved: !deal.saved })}>
                        <Bookmark className={`mr-1 h-4 w-4 ${deal.saved ? "fill-current" : ""}`} /> {deal.saved ? "Saved" : "Save"} <kbd className="ml-1 text-[10px] opacity-60">S</kbd>
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

                    {/* Price history */}
                    {deal.priceHistory && deal.priceHistory.length > 1 && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <Label className="text-xs font-semibold mb-2 block">Price History</Label>
                        <div className="space-y-1">
                          {[...deal.priceHistory].reverse().map((ph, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{new Date(ph.date).toLocaleDateString()}</span>
                              <span className="font-medium">${ph.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="profit" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground text-xs">Listing Price</span><p className="font-semibold">${deal.price.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Est. Resale</span><p className="font-semibold">${deal.estimatedValue.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Est. Profit</span><p className="font-semibold text-green-500">${deal.profit.toLocaleString()}</p></div>
                      <div><span className="text-muted-foreground text-xs">Confidence</span><p className="font-semibold">{Math.round(deal.confidence * 100)}%</p></div>
                    </div>

                    {deal.actualProfit !== null && (
                      <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-xs">Shipping</span><span>-${(deal.shippingCost ?? 0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-xs">Fees</span><span>-${(deal.fees ?? 0).toFixed(2)}</span></div>
                        <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                          <span className="text-xs">Net Profit</span>
                          <span className={deal.actualProfit > 0 ? "text-green-500" : "text-red-500"}>
                            ${deal.actualProfit.toFixed(2)}
                          </span>
                        </div>
                        {deal.costBasis && (
                          <div className="flex justify-between text-xs">
                            <span>Cost Basis</span><span>${deal.costBasis.toFixed(2)}</span>
                          </div>
                        )}
                        {deal.roi !== null && (
                          <div className="flex justify-between text-xs">
                            <span>ROI</span><span className={deal.roi > 0 ? "text-green-500" : "text-red-500"}>{deal.roi}%</span>
                          </div>
                        )}
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
                            <Label className="text-xs">What did you sell it for?</Label>
                            <Input type="number" placeholder={String(deal.estimatedValue)} value={actualSalePrice} onChange={e => setActualSalePrice(e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-xs">Shipping cost</Label>
                            <Input type="number" placeholder="0" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
                          </div>
                          <div>
                            <Label className="text-xs">Platform fees / other costs</Label>
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
                            const ship = parseFloat(shippingCost || "0")
                            const fee = parseFloat(fees || "0")
                            const profit = profitCalc ?? 0
                            const actualSale = parseFloat(actualSalePrice || "0")
                            const costBasis = deal.price + ship + fee
                            const roi = costBasis > 0 ? ((actualSale - costBasis) / costBasis * 100) : 0
                            updateDeal(deal.id, {
                              shippingCost: ship,
                              fees: fee,
                              actualProfit: profit,
                              costBasis,
                              roi: Math.round(roi * 10) / 10,
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
                    <Textarea placeholder="Add notes about this deal..." value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={5} />
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => { updateDeal(deal.id, { notes: editNotes }) }}>
                        Save Notes <kbd className="ml-1 text-[10px] opacity-60">⌘⏎</kbd>
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="space-y-3">
                    <Label className="text-xs font-semibold flex items-center gap-1">
                      <History className="h-3 w-3" /> Activity Log
                    </Label>
                    {(!deal.activities || deal.activities.length === 0) && (
                      <p className="text-xs text-muted-foreground">No activity recorded yet</p>
                    )}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {deal.priceHistory && [...deal.priceHistory].reverse().map((ph, i) => (
                        <div key={`ph-${i}`} className="flex items-center gap-2 text-xs bg-muted/20 rounded p-2">
                          <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground">{new Date(ph.date).toLocaleDateString()}</span>
                          <span className="font-medium">${ph.price.toLocaleString()}</span>
                        </div>
                      ))}
                      {deal.activities?.map((act) => (
                        <div key={act.id} className="flex items-center gap-2 text-xs bg-muted/20 rounded p-2">
                          {act.type === "status_change" ? <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" /> :
                           act.type === "price_drop" ? <TrendingDown className="h-3 w-3 text-orange-500 shrink-0" /> :
                           <Clock className="h-3 w-3 text-muted-foreground shrink-0" />}
                          <span className="text-muted-foreground">{new Date(act.createdAt).toLocaleDateString()}</span>
                          <span>{act.message}</span>
                        </div>
                      ))}
                    </div>
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
