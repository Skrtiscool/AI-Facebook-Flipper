import { NextRequest } from "next/server"
import { getScanProgress } from "@/services/scanner/progress"

export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder()

  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        if (closed) return
        const data = getScanProgress()
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          closed = true
          return
        }
        if (data.status === "completed" || data.status === "failed") {
          closed = true
          try { controller.close() } catch { /* already closed */ }
          return
        }
        setTimeout(send, 1000)
      }
      send()
    },
    cancel() {
      closed = true
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
