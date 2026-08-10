import { PrismaClient } from "@prisma/client";
import { env } from "../env.js";

// Avoid exhausting DB connections from tsx watch's module reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV === "development") {
  globalForPrisma.prisma = prisma;
}
