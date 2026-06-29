import { NextRequest } from "next/server"
import { getScanProgress } from "@/services/scanner/progress"

export async function GET(_request: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        const data = getScanProgress()
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        if (data.status === "completed" || data.status === "failed") {
          controller.close()
          return
        }
        setTimeout(send, 1000)
      }
      send()
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
