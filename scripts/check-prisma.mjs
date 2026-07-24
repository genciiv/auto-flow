import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL mungon.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

console.log("auditLog type:", typeof prisma.auditLog);

console.log(
  "Prisma delegates:",
  Object.keys(prisma)
    .filter((key) => !key.startsWith("_") && !key.startsWith("$"))
    .sort(),
);

await prisma.$disconnect();
