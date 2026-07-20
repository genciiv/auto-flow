import { db } from "@/lib/db";

export async function createBusinessApplication({
  businessName,
  ownerName,
  email,
  phone,
  city,
  address,
  notes,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingPendingApplication = await db.businessApplication.findFirst({
    where: {
      email: normalizedEmail,
      status: "PENDING",
    },
    select: {
      id: true,
    },
  });

  if (existingPendingApplication) {
    throw new Error(
      "Ekziston tashmë një aplikim në pritje me këtë adresë emaili.",
    );
  }

  return db.businessApplication.create({
    data: {
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      city: city.trim(),
      address: address?.trim() || null,
      notes: notes?.trim() || null,
    },
  });
}
