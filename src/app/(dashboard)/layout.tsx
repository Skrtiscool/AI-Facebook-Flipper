"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze Item", icon: Search },
  { href: "/saved-deals", label: "Saved Deals", icon: Bookmark },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/account", label: "Account", icon: User },
]

function SidebarContent() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold">FlipScout</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
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

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
            U
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
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
      <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}
