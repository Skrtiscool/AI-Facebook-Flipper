import type { Deal } from "@prisma/client"
import type { AnalysisResult } from "@/services/aiAnalyzer"

interface DiscordEmbed {
  title: string
  description?: string
  url?: string
  color: number
  fields: Array<{ name: string; value: string; inline?: boolean }>
  image?: { url: string }
  footer?: { text: string }
  timestamp?: string
}

export async function sendDealAlert(
  config: { webhookUrl: string },
  deal: Deal,
  analysis: AnalysisResult
): Promise<void> {
  if (!config.webhookUrl) {
    console.warn("[Discord] No webhook URL configured")
    return
  }

  const isBuy = deal.recommendation === "buy"
  const color = isBuy ? 0x22c55e : deal.recommendation === "maybe" ? 0xf59e0b : 0xef4444

  const embed: DiscordEmbed = {
    title: `💰 ${isBuy ? "BUY" : "PASS"}: ${deal.title}`,
    url: deal.listingUrl || undefined,
    color,
    fields: [
      {
        name: "Listed Price",
        value: `$${deal.price.toFixed(0)}`,
        inline: true,
      },
      {
        name: "Est. Market Value",
        value: `$${deal.estimatedValue.toFixed(0)}`,
        inline: true,
      },
      {
        name: "Est. Profit",
        value: `$${deal.profit.toFixed(0)}`,
        inline: true,
      },
      {
        name: "Deal Score",
        value: `${deal.score}/100`,
        inline: true,
      },
      {
        name: "Platform",
        value: deal.platform || "Facebook Marketplace",
        inline: true,
      },
      {
        name: "Condition",
        value: deal.condition || "Unknown",
        inline: true,
      },
    ],
    image: deal.imageUrls?.[0] ? { url: deal.imageUrls[0] } : undefined,
    footer: { text: "FlipScout Scanner" },
    timestamp: new Date().toISOString(),
  }

  const payload = {
    embeds: [embed],
    content: isBuy ? "**🔔 Profitable deal found!**" : "**Deal scanned**",
  }

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status}`)
  }

  console.log("[Discord] Alert sent successfully")
}

export async function testWebhook(webhookUrl: string): Promise<boolean> {
  try {
    const payload = {
      content: "✅ **FlipScout scanner is connected!** You'll receive deal alerts here.",
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    return response.ok
  } catch {
    return false
  }
}
