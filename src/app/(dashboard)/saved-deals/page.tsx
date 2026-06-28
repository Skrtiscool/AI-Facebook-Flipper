"use client"

import { Bookmark } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function SavedDealsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Saved Deals</h1>
        <p className="text-muted-foreground">Your bookmarked opportunities.</p>
      </div>

      <Card className="glass border-0">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Bookmark className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No saved deals yet</h3>
          <p className="mb-6 text-sm text-muted-foreground">
            Start analyzing items and save the best opportunities here.
          </p>
          <Button>Analyze an Item</Button>
        </CardContent>
      </Card>
    </div>
  )
}
