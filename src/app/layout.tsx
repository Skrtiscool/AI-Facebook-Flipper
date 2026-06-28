import {ClerkProvider} from "@clerk/nextjs";
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FlipScout — AI-Powered Flipping Assistant",
  description:
    "FlipScout uses AI to discover undervalued marketplace deals, predict resale value, and calculate profit instantly.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}