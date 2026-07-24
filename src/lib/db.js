import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL mungon. Kontrollo file-in .env.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const db = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});
