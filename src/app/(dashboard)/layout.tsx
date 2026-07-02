"use client"

import { useState, useEffect } from "react"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Bell,
  User,
  Sparkles,
  Menu,
  LogOut,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze Item", icon: Search },
  { href: "/saved-deals", label: "Deal Pipeline", icon: Bookmark },
  { href: "/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/account", label: "Account", icon: User },
]

function SidebarContent() {
  const pathname = usePathname()
  const [plan, setPlan] = useState("free")

  useEffect(() => {
    fetch("/api/stripe/subscription")
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) setPlan(d.plan)
      })
      .catch(() => {})
  }, [])

  const planLabel = plan === "free" ? "Free Plan" : plan === "pro" ? "Pro Plan" : "Biz Plan"

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <Link href="/dashboard" className="text-lg font-bold hover:opacity-80 transition-opacity">FlipScout</Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4 space-y-2">
        <Link
          href="/pricing"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
        >
          <ArrowUpRight className="h-3 w-3" />
          {plan === "free" ? "Upgrade plan" : "Manage plan"}
        </Link>
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <UserButton />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Signed in</p>
            <p className="text-xs text-muted-foreground">{planLabel}</p>
          </div>
          <SignOutButton>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 border-r border-border md:block">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger className="fixed top-4 left-4 z-40 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background pt-14 p-6 md:pt-8 md:p-8">
        {children}
      </main>
    </div>
  )
}
