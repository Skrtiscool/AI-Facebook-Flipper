let _prisma: any = null

export function getPrisma() {
  if (!_prisma) {
    // Lazy init — only create Prisma client when first used at runtime
    // This avoids build-time failures when DATABASE_URL is not set
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PrismaClient } = require("@prisma/client")
      _prisma = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["warn", "error"]
            : ["error"],
      })
    } catch (e: any) {
      throw new Error(
        `Database connection failed: ${e?.message || e}. Set DATABASE_URL in .env.local and add a Prisma adapter.`
      )
    }
  }
  return _prisma
}

type PrismaClient = ReturnType<typeof getPrisma>

export const prisma = new Proxy(
  {},
  {
    get(_target, prop: string) {
      const client = getPrisma()
      return client[prop]
    },
  }
) as PrismaClient
