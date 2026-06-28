"use client"

import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-muted-foreground">Get notified when profitable deals match your criteria.</p>
      </div>

      <Card className="glass border-0">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No alerts set up</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Create alerts for specific items, brands, or price thresholds.
          </p>
          <Button>Create Alert</Button>
        </CardContent>
      </Card>
    </div>
  )
}
