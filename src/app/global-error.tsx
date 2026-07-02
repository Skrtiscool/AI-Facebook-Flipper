"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black p-8 text-white">
        <h1 className="text-2xl font-bold">Critical Error</h1>
        <p className="text-sm text-gray-400">{error.message}</p>
        <button
          onClick={() => reset()}
          className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black"
        >
          Reload
        </button>
      </body>
    </html>
  )
}
