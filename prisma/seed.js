import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.part.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.serviceRecord.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.businessUser.deleteMany();
  await prisma.business.deleteMany();

  const user = await prisma.user.upsert({
    where: { email: "owner@autoflow.al" },
    update: {},
    create: {
      name: "Auto Service Owner",
      email: "owner@autoflow.al",
      role: "OWNER",
    },
  });

  const business = await prisma.business.create({
    data: {
      name: "Auto Service Fier",
      city: "Fier",
      address: "Fier, Albania",
      phone: "+355 69 000 0000",
      email: "info@autoflow.al",
      users: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
    },
  });

  const customer = await prisma.customer.create({
    data: {
      businessId: business.id,
      name: "Arben Hoxha",
      phone: "+355 69 123 4567",
      email: "arben@example.com",
      city: "Fier",
    },
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      businessId: business.id,
      customerId: customer.id,
      plate: "AA123BB",
      brand: "BMW",
      model: "X5",
      year: 2018,
      vin: "WBA1234567890X5",
    },
  });

  const service = await prisma.serviceRecord.create({
    data: {
      businessId: business.id,
      vehicleId: vehicle.id,
      customerId: customer.id,
      title: "Ndërrim vaji + filtra",
      description: "Ndërrim vaji, filtër vaji dhe kontroll bazë.",
      status: "IN_PROGRESS",
      total: 240,
    },
  });

  await prisma.appointment.create({
    data: {
      businessId: business.id,
      vehicleId: vehicle.id,
      customerId: customer.id,
      title: "Servis periodik",
      date: new Date(),
      status: "PENDING",
    },
  });

  await prisma.part.createMany({
    data: [
      {
        businessId: business.id,
        code: "MANN-HU7020",
        name: "Filtri vajit MANN",
        category: "Filtra",
        supplier: "Auto Parts Albania",
        stock: 4,
        minStock: 5,
        buyPrice: 700,
        sellPrice: 1200,
      },
      {
        businessId: business.id,
        code: "CASTROL-5W30",
        name: "Vaj motori Castrol 5W-30",
        category: "Vajra",
        supplier: "Lubricants Tirana",
        stock: 18,
        minStock: 6,
        buyPrice: 1400,
        sellPrice: 2200,
      },
    ],
  });

  await prisma.invoice.create({
    data: {
      businessId: business.id,
      customerId: customer.id,
      vehicleId: vehicle.id,
      serviceId: service.id,
      number: "INV-1024",
      status: "PAID",
      total: 240,
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      businessId: business.id,
      supplier: "Auto Parts Albania",
      status: "PENDING",
      total: 42000,
      notes: "Porosi për filtra dhe pjesë konsumi.",
      items: {
        create: [
          {
            name: "Filtra vaji MANN",
            quantity: 20,
            unitPrice: 700,
            total: 14000,
          },
          {
            name: "Filtra ajri",
            quantity: 20,
            unitPrice: 1400,
            total: 28000,
          },
        ],
      },
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      businessId: business.id,
      supplier: "Lubricants Tirana",
      status: "ORDERED",
      total: 68000,
      notes: "Vaj motori për magazinë.",
      items: {
        create: [
          {
            name: "Vaj Castrol 5W-30",
            quantity: 40,
            unitPrice: 1700,
            total: 68000,
          },
        ],
      },
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      businessId: business.id,
      supplier: "Balkan Auto Parts",
      status: "RECEIVED",
      total: 95000,
      notes: "Pjesë frenimi për Golf 7 dhe Audi A4.",
      items: {
        create: [
          {
            name: "Disqe frenash Brembo",
            quantity: 10,
            unitPrice: 4500,
            total: 45000,
          },
          {
            name: "Ferodo Golf 7",
            quantity: 10,
            unitPrice: 5000,
            total: 50000,
          },
        ],
      },
    },
  });

  console.log("Seed data created successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
