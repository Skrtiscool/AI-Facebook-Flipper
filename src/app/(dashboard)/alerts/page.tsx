"use client"

import { useState, useEffect } from "react"
import { usePageTitle } from "@/lib/usePageTitle"
import { Plus, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Alert {
  id: string
  name: string
  keywords: string[]
  brands: string[]
  maxPrice: number | null
  minProfit: number | null
  minScore: number | null
  active: boolean
  lastRunAt: string | null
}

export default function AlertsPage() {
  usePageTitle("Alerts")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: "",
    keywords: "",
    brands: "",
    maxPrice: "",
    minProfit: "",
    minScore: "",
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    const res = await fetch("/api/alerts")
    if (res.ok) setAlerts(await res.json())
    setLoading(false)
  }

  async function createAlert() {
    const keywords = form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    const brands = form.brands.split(",").map((b) => b.trim()).filter(Boolean)

    if (!form.name || keywords.length === 0) return

    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        keywords,
        brands,
        maxPrice: form.maxPrice || null,
        minProfit: form.minProfit || null,
        minScore: form.minScore || null,
      }),
    })

    if (res.ok) {
      setShowForm(false)
      setForm({ name: "", keywords: "", brands: "", maxPrice: "", minProfit: "", minScore: "" })
      fetchAlerts()
    }
  }

  async function toggleAlert(alert: Alert) {
    await fetch(`/api/alerts/${alert.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !alert.active }),
    })
    fetchAlerts()
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" })
    fetchAlerts()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Scan Alerts</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Set what to scan for — FlipScout checks every 30 minutes.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> New Alert
        </Button>
      </div>

      {/* New alert form */}
      {showForm && (
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">New Scan Alert</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Alert Name</Label>
              <Input
                placeholder="e.g. Milwaukee Tools"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Keywords (comma separated) *</Label>
              <Input
                placeholder="milwaukee, m18, fuel, drill"
                value={form.keywords}
                onChange={(e) => setForm({ ...form, keywords: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Brands (comma separated)</Label>
              <Input
                placeholder="Milwaukee, DeWalt, Makita"
                value={form.brands}
                onChange={(e) => setForm({ ...form, brands: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
              <div className="space-y-2">
                <Label>Max Price ($)</Label>
                <Input
                  placeholder="150"
                  value={form.maxPrice}
                  onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Profit ($)</Label>
                <Input
                  placeholder="50"
                  value={form.minProfit}
                  onChange={(e) => setForm({ ...form, minProfit: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Score</Label>
                <Input
                  placeholder="70"
                  value={form.minScore}
                  onChange={(e) => setForm({ ...form, minScore: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={createAlert} className="flex-1 sm:flex-none">Create Alert</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="glass border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-lg font-medium">No alerts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first alert to start scanning for deals.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="glass border-0">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{alert.name}</p>
                    <Badge
                      variant="secondary"
                      className={alert.active ? "bg-emerald-500/20 text-emerald-400" : ""}
                    >
                      {alert.active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {alert.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-md bg-muted px-2 py-0.5 text-xs"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                    {alert.maxPrice && <span>Max: ${alert.maxPrice}</span>}
                    {alert.minProfit && <span>Min profit: ${alert.minProfit}</span>}
                    {alert.minScore && <span>Min score: {alert.minScore}/100</span>}
                    {alert.lastRunAt && (
                      <span>Last scan: {new Date(alert.lastRunAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleAlert(alert)}
                  >
                    {alert.active ? (
                      <ToggleRight className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
