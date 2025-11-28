// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../generated/prisma";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
    // Pass DATABASE_URL to the client for Prisma 7+
    // The datasource in schema.prisma has no URL; it's provided here
    datasources: {
      db: {
        url: process.env.DATABASE_URL || "",
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;