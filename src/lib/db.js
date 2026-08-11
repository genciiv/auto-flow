import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL mungon. Kontrollo file-in .env.");
}

const globalForPrisma = globalThis;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL.replace(
    /([?&])sslmode=require(?=&|$)/,
    "$1sslmode=verify-full",
  );

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({
    adapter,

    log:
      process.env.PRISMA_LOG_QUERIES === "true"
        ? ["query", "error", "warn"]
        : process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
  });
}

export const db = globalForPrisma.__autoFlowPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__autoFlowPrisma = db;
}
