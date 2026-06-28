"use client"

import { User, Shield, CreditCard, Bell as BellIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="text-muted-foreground">Manage your account settings and subscription.</p>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <User className="h-4 w-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
              U
            </div>
            <div>
              <p className="font-medium">User</p>
              <p className="text-sm text-muted-foreground">user@example.com</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CreditCard className="h-4 w-4" /> Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-muted-foreground">You are on the Free plan</p>
            </div>
            <Badge variant="secondary">Free</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Upgrade to Pro</p>
              <p className="text-sm text-muted-foreground">$19/month - Unlimited analyses & advanced features</p>
            </div>
            <Button size="sm">Upgrade</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
