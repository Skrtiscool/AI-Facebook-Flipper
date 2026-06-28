import { clerkMiddleware } from "@clerk/nextjs/server"

// Export Clerk middleware for authentication
// Protected routes will require sign-in
export default clerkMiddleware()

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    "/analyze/:path*",
    "/saved-deals/:path*",
    "/alerts/:path*",
    "/account/:path*",
    // Always run for API routes
    "/api/:path*",
  ],
}
