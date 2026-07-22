import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL mungon. Kontrollo skedarin .env.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({
  adapter,
});

const EMAIL = "owner@autoflow.al";
const NEW_PASSWORD = "AutoFlow123!";

async function resetPassword() {
  const email = EMAIL.trim().toLowerCase();

  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      globalRole: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new Error(`Nuk u gjet përdoruesi me email: ${email}`);
  }

  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 12);

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      passwordHash,
      isActive: true,
    },
  });

  console.log("Password-i u rivendos me sukses.");
  console.log(`Përdoruesi: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Roli global: ${user.globalRole}`);
  console.log(`Password i ri: ${NEW_PASSWORD}`);
}

resetPassword()
  .catch((error) => {
    console.error("Gabim gjatë rivendosjes së password-it:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
