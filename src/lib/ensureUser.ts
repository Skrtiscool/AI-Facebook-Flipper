import { prisma } from "@/lib/prisma"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function ensureUser() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (existing) return existing

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const email = clerkUser.emailAddresses[0]?.emailAddress

  return prisma.user.create({
    data: {
      clerkId: userId,
      email: email || `${userId}@placeholder.com`,
      name: clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : null,
      imageUrl: clerkUser.imageUrl,
    },
  })
}
