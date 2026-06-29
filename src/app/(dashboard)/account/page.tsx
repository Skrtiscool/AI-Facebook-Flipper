"use client"

import { useState, useEffect } from "react"
import { User, MessageCircle, Check, X, Loader2, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function AccountPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [savedWebhook, setSavedWebhook] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null)

  const [fbConnected, setFbConnected] = useState(false)
  const [fbConnecting, setFbConnecting] = useState(false)

  useEffect(() => {
    fetch("/api/notifications/discord")
      .then((r) => r.json())
      .then((data) => {
        if (data?.config) {
          const config = JSON.parse(data.config)
          setWebhookUrl(config.webhookUrl || "")
          setSavedWebhook(config.webhookUrl || null)
        }
      })
      .catch(() => {})

    fetch("/api/scanner/auth")
      .then((r) => r.json())
      .then((data) => setFbConnected(data.connected))
      .catch(() => {})
  }, [])

  async function saveWebhook() {
    setTesting(true)
    setTestResult(null)

    const res = await fetch("/api/notifications/discord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ webhookUrl }),
    })

    if (res.ok) {
      setSavedWebhook(webhookUrl)
      setTestResult("success")
    } else {
      setTestResult("error")
    }

    setTesting(false)
    setTimeout(() => setTestResult(null), 3000)
  }

  async function connectFacebook() {
    setFbConnecting(true)
    try {
      const res = await fetch("/api/scanner/auth", { method: "POST" })
      if (res.ok) {
        setFbConnected(true)
      } else {
        const err = await res.json()
        alert(err.error || "Failed to connect Facebook")
      }
    } catch {
      alert("Connection failed")
    }
    setFbConnecting(false)
  }

  async function disconnectFacebook() {
    await fetch("/api/scanner/auth", { method: "DELETE" })
    setFbConnected(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your account and notification settings.
        </p>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              U
            </div>
            <div>
              <p className="font-medium">Signed in with Clerk</p>
              <p className="text-sm text-muted-foreground">
                Your account is connected via Clerk.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <SubscriptionCard />

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Globe className="h-4 w-4" /> Facebook Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            FlipScout needs access to Facebook Marketplace to scan for deals.
            Click below to open a browser and log in. Your session will be saved
            securely.
          </p>

          <div className="flex items-center gap-3">
            {fbConnected ? (
              <>
                <Badge className="bg-emerald-500/20 text-emerald-400 gap-1">
                  <Check className="h-3 w-3" /> Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectFacebook}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={connectFacebook}
                disabled={fbConnecting}
                className="gap-2"
              >
                {fbConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Opening
                    browser...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" /> Connect Facebook
                  </>
                )}
              </Button>
            )}
          </div>

          {!fbConnected && (
            <p className="text-xs text-muted-foreground">
              A browser window will open. Log into Facebook, then close the
              window. Your session will be saved for future scans.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <MessageCircle className="h-4 w-4" /> Discord Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Discord Webhook URL</Label>
            <Input
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get a webhook URL from your Discord server settings &gt;
              Integrations &gt; Webhooks. FlipScout will send deal alerts there.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={saveWebhook}
              disabled={testing || !webhookUrl}
              className="gap-2"
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Testing...
                </>
              ) : (
                "Save & Test"
              )}
            </Button>
            {testResult === "success" && (
              <Badge className="bg-emerald-500/20 text-emerald-400 gap-1">
                <Check className="h-3 w-3" /> Connected
              </Badge>
            )}
            {testResult === "error" && (
              <Badge className="bg-red-500/20 text-red-400 gap-1">
                <X className="h-3 w-3" /> Invalid webhook
              </Badge>
            )}
          </div>

          {savedWebhook && (
            <p className="text-xs text-emerald-400">
              ✓ Discord alerts are active. You will receive deal notifications
              here.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Browser push notifications */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5" /> Browser Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Get notified in your browser when new deals are found during scans.
          </p>
          <Button id="push-subscribe-btn" variant="outline" onClick={async () => {
            try {
              const reg = await navigator.serviceWorker?.ready
              if (!reg) { alert("Service worker not supported"); return }
              const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array("BEl62iUYgUiv0I2K1i64QfJp5KkfVJzXGqYXxVKxYQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ"),
              })
              await fetch("/api/notifications/push", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription: sub.toJSON() }),
              })
              alert("Push notifications enabled!")
            } catch (e: any) {
              alert(`Push notification error: ${e.message}`)
            }
          }}>
            Enable Push Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SubscriptionCard() {
  const [sub, setSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stripe/subscription").then(r => r.json()).then(setSub).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("checkout") === "success") {
        window.history.replaceState({}, "", "/account")
        fetch("/api/stripe/subscription").then(r => r.json()).then(setSub)
      }
    }
  }, [])

  if (loading) return null

  const isPaid = sub?.plan !== "free"
  const scansLeft = sub?.scanLimit ? sub.scanLimit - (sub.scansUsed || 0) : "Unlimited"

  return (
    <Card className="glass border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <User className="h-4 w-4" /> Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium capitalize">{sub?.planName || "Free"} Plan</p>
            <p className="text-xs text-muted-foreground">{scansLeft} scans remaining this month</p>
          </div>
          <Badge className={isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}>
            {isPaid ? "Active" : "Free"}
          </Badge>
        </div>
        {sub?.cancelAtPeriodEnd && (
          <p className="text-xs text-orange-400">Cancels at period end</p>
        )}
        {sub?.currentPeriodEnd && (
          <p className="text-xs text-muted-foreground">
            Current period ends {new Date(sub.currentPeriodEnd).toLocaleDateString()}
          </p>
        )}
        <div className="flex gap-2">
          {isPaid ? (
            <Button variant="outline" size="sm" onClick={async () => {
              const res = await fetch("/api/stripe/portal")
              const data = await res.json()
              if (data.url) window.location.href = data.url
            }}>
              Manage Subscription
            </Button>
          ) : (
            <Button size="sm" className="gap-1" onClick={() => window.location.href = "/pricing"}>
              Upgrade Plan
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}
