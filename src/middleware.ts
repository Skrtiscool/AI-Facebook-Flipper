import { clerkMiddleware } from "@clerk/nextjs/server"

// Export Clerk middleware for authentication
// Protected routes will require sign-in
export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!_next|_next/static|favicon.ico).*)",
  ],
}
