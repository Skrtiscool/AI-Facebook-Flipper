import { clerkMiddleware } from "@clerk/nextjs/server"

// Export Clerk middleware for authentication
// Protected routes will require sign-in
export default clerkMiddleware()

export const config = {
  matcher: [
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
    "/dashboard/:path*",
    "/analyze/:path*",
    "/saved-deals/:path*",
    "/alerts/:path*",
    "/account/:path*",
  ],
}
