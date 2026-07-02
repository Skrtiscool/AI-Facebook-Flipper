import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "FlipScout — AI-Powered Flipping Assistant",
    template: "%s | FlipScout",
  },
  description:
    "FlipScout uses AI to discover undervalued marketplace deals, predict resale value, and calculate profit instantly.",
  openGraph: {
    title: "FlipScout — AI-Powered Flipping Assistant",
    description:
      "Discover undervalued marketplace deals with AI. Predict resale value, calculate profit, and never miss a flip.",
    url: "https://ai-facebook-flipper.vercel.app",
    siteName: "FlipScout",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlipScout — AI-Powered Flipping Assistant",
    description:
      "Discover undervalued marketplace deals with AI. Predict resale value, calculate profit, and never miss a flip.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.svg",
  },
  manifest: "/manifest",
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
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: "!border-border !bg-background !text-foreground",
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  )
}