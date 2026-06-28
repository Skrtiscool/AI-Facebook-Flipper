"use client"

import {
  TrendingUp,
  DollarSign,
  Trophy,
  Bookmark,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const stats = [
  {
    title: "Total Deals Found",
    value: "47",
    change: "+12%",
    trend: "up",
    icon: TrendingUp,
  },
  {
    title: "Average Profit",
    value: "$184",
    change: "+8%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Best Flip",
    value: "$520",
    change: "Milwaukee M18",
    trend: "up",
    icon: Trophy,
  },
  {
    title: "Saved Opportunities",
    value: "12",
    change: "+3",
    trend: "up",
    icon: Bookmark,
  },
]

const chartData = [
  { name: "Mon", profit: 400 },
  { name: "Tue", profit: 300 },
  { name: "Wed", profit: 600 },
  { name: "Thu", profit: 800 },
  { name: "Fri", profit: 500 },
  { name: "Sat", profit: 900 },
  { name: "Sun", profit: 700 },
]

const recentDeals = [
  {
    title: "Milwaukee M18 Fuel Drill Kit",
    price: 120,
    value: 350,
    profit: 230,
    score: 94,
    recommendation: "buy",
  },
  {
    title: "Sony WH-1000XM5 Headphones",
    price: 180,
    value: 280,
    profit: 100,
    score: 78,
    recommendation: "buy",
  },
  {
    title: "iPhone 15 Pro Max 256GB",
    price: 900,
    value: 950,
    profit: 50,
    score: 45,
    recommendation: "pass",
  },
  {
    title: "Nintendo Switch OLED Zelda Edition",
    price: 250,
    value: 400,
    profit: 150,
    score: 88,
    recommendation: "buy",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your flipping overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="glass border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                <span className={stat.trend === "up" ? "text-emerald-500" : "text-red-500"}>
                  {stat.change}
                </span>
                {" vs last week"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart + Recent Deals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Profit Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--primary))"
                    fill="url(#profitGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDeals.map((deal) => (
                <div
                  key={deal.title}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate max-w-[200px]">{deal.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Listed: ${deal.price} &middot; Est: ${deal.value}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">+${deal.profit}</p>
                    <Badge
                      className={
                        deal.recommendation === "buy"
                          ? "bg-emerald-500/20 text-emerald-400 text-xs"
                          : "bg-red-500/20 text-red-400 text-xs"
                      }
                    >
                      {deal.recommendation === "buy" ? "BUY" : "PASS"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
