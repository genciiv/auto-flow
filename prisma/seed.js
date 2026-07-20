const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL mungon. Kontrollo file-in .env ose .env.local.",
  );
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({
  adapter,
});

async function createOrUpdatePlatformAdmin() {
  const adminPassword = "Admin123!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const platformAdmin = await db.user.upsert({
    where: {
      email: "admin@autoflow.al",
    },
    update: {
      name: "AutoFlow Admin",
      passwordHash: adminPasswordHash,
      globalRole: "PLATFORM_ADMIN",
      isActive: true,
    },
    create: {
      name: "AutoFlow Admin",
      email: "admin@autoflow.al",
      passwordHash: adminPasswordHash,
      globalRole: "PLATFORM_ADMIN",
      isActive: true,
    },
  });

  return {
    user: platformAdmin,
    password: adminPassword,
  };
}

async function createOrUpdateBusiness() {
  const existingBusiness = await db.business.findFirst({
    where: {
      name: "Auto Service Fier",
    },
  });

  if (existingBusiness) {
    return db.business.update({
      where: {
        id: existingBusiness.id,
      },
      data: {
        city: "Fier",
        address: "Fier, Shqipëri",
        phone: "+355 69 000 0000",
        email: "info@autoservicefier.al",
        isActive: true,
      },
    });
  }

  return db.business.create({
    data: {
      name: "Auto Service Fier",
      city: "Fier",
      address: "Fier, Shqipëri",
      phone: "+355 69 000 0000",
      email: "info@autoservicefier.al",
      isActive: true,
    },
  });
}

async function createOrUpdateOwner(businessId) {
  const ownerPassword = "Owner123!";
  const hashedPassword = await bcrypt.hash(ownerPassword, 12);

  const owner = await db.user.upsert({
    where: {
      email: "owner@autoflow.al",
    },
    update: {
      name: "Auto Service Owner",
      passwordHash: hashedPassword,
      globalRole: null,
      isActive: true,
    },
    create: {
      name: "Auto Service Owner",
      email: "owner@autoflow.al",
      passwordHash: hashedPassword,
      isActive: true,
    },
  });

  const businessUser = await db.businessUser.upsert({
    where: {
      userId_businessId: {
        userId: owner.id,
        businessId,
      },
    },
    update: {
      role: "OWNER",
      isActive: true,
    },
    create: {
      userId: owner.id,
      businessId,
      role: "OWNER",
      isActive: true,
    },
  });

  return {
    user: owner,
    businessUser,
    password: ownerPassword,
  };
}

async function createOrUpdateCustomer(businessId) {
  const existingCustomer = await db.customer.findFirst({
    where: {
      businessId,
      email: "arben.hoxha@example.com",
    },
  });

  if (existingCustomer) {
    return db.customer.update({
      where: {
        id: existingCustomer.id,
      },
      data: {
        name: "Arben Hoxha",
        phone: "+355 69 111 2233",
        city: "Fier",
      },
    });
  }

  return db.customer.create({
    data: {
      businessId,
      name: "Arben Hoxha",
      phone: "+355 69 111 2233",
      email: "arben.hoxha@example.com",
      city: "Fier",
    },
  });
}

async function createOrUpdateVehicle({ businessId, customerId }) {
  return db.vehicle.upsert({
    where: {
      businessId_plate: {
        businessId,
        plate: "AA123BB",
      },
    },
    update: {
      customerId,
      brand: "Volkswagen",
      model: "Jetta",
      year: 2012,
      vin: "3VWDX7AJ0CM000001",
    },
    create: {
      businessId,
      customerId,
      plate: "AA123BB",
      brand: "Volkswagen",
      model: "Jetta",
      year: 2012,
      vin: "3VWDX7AJ0CM000001",
    },
  });
}

async function createOrUpdatePart(businessId) {
  return db.part.upsert({
    where: {
      businessId_code: {
        businessId,
        code: "OIL-5W30-5L",
      },
    },
    update: {
      name: "Vaj motori 5W-30, 5L",
      category: "Vajra",
      supplier: "Auto Pjesë Albania",
      stock: 10,
      minStock: 3,
      buyPrice: 3500,
      sellPrice: 5000,
    },
    create: {
      businessId,
      code: "OIL-5W30-5L",
      name: "Vaj motori 5W-30, 5L",
      category: "Vajra",
      supplier: "Auto Pjesë Albania",
      stock: 10,
      minStock: 3,
      buyPrice: 3500,
      sellPrice: 5000,
    },
  });
}

async function createOrUpdateService({ businessId, customerId, vehicleId }) {
  const existingService = await db.serviceRecord.findFirst({
    where: {
      businessId,
      vehicleId,
      title: "Ndërrim vaji dhe filtrash",
    },
  });

  if (existingService) {
    return db.serviceRecord.update({
      where: {
        id: existingService.id,
      },
      data: {
        customerId,
        description:
          "Ndërrim vaji motori dhe kontroll i filtrave të automjetit.",
        status: "COMPLETED",
        total: 10000,
      },
    });
  }

  return db.serviceRecord.create({
    data: {
      businessId,
      customerId,
      vehicleId,
      title: "Ndërrim vaji dhe filtrash",
      description: "Ndërrim vaji motori dhe kontroll i filtrave të automjetit.",
      status: "COMPLETED",
      total: 10000,
    },
  });
}

async function createOrUpdateServicePartUsage({ serviceId, partId }) {
  return db.servicePartUsage.upsert({
    where: {
      serviceId_partId: {
        serviceId,
        partId,
      },
    },
    update: {
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
    },
    create: {
      serviceId,
      partId,
      quantity: 1,
      unitPrice: 5000,
      total: 5000,
    },
  });
}

async function createOrUpdateInvoice({
  businessId,
  customerId,
  vehicleId,
  serviceId,
}) {
  const existingInvoice = await db.invoice.findUnique({
    where: {
      businessId_number: {
        businessId,
        number: "INV-0001",
      },
    },
  });

  if (existingInvoice) {
    return db.invoice.update({
      where: {
        id: existingInvoice.id,
      },
      data: {
        customerId,
        vehicleId,
        serviceId,
        status: "PAID",
        total: 10000,
      },
    });
  }

  return db.invoice.create({
    data: {
      businessId,
      customerId,
      vehicleId,
      serviceId,
      number: "INV-0001",
      status: "PAID",
      total: 10000,
    },
  });
}

async function createOrUpdateAppointment({
  businessId,
  customerId,
  vehicleId,
}) {
  const appointmentDate = new Date();

  appointmentDate.setDate(appointmentDate.getDate() + 1);
  appointmentDate.setHours(10, 0, 0, 0);

  const existingAppointment = await db.appointment.findFirst({
    where: {
      businessId,
      customerId,
      vehicleId,
      title: "Kontroll i përgjithshëm",
    },
  });

  if (existingAppointment) {
    return db.appointment.update({
      where: {
        id: existingAppointment.id,
      },
      data: {
        date: appointmentDate,
        description: "Kontroll i përgjithshëm i automjetit dhe diagnostikim.",
        status: "PENDING",
      },
    });
  }

  return db.appointment.create({
    data: {
      businessId,
      customerId,
      vehicleId,
      title: "Kontroll i përgjithshëm",
      description: "Kontroll i përgjithshëm i automjetit dhe diagnostikim.",
      date: appointmentDate,
      status: "PENDING",
    },
  });
}

async function createOrUpdatePurchaseOrder(businessId) {
  const existingPurchaseOrder = await db.purchaseOrder.findFirst({
    where: {
      businessId,
      supplier: "Auto Pjesë Albania",
      notes: "Porosi fillestare demo",
    },
  });

  if (existingPurchaseOrder) {
    return db.purchaseOrder.update({
      where: {
        id: existingPurchaseOrder.id,
      },
      data: {
        status: "RECEIVED",
        total: 35000,
        items: {
          deleteMany: {},
          create: [
            {
              name: "Vaj motori 5W-30, 5L",
              quantity: 5,
              unitPrice: 3500,
              total: 17500,
            },
            {
              name: "Filtër vaji",
              quantity: 10,
              unitPrice: 1000,
              total: 10000,
            },
            {
              name: "Filtër ajri",
              quantity: 5,
              unitPrice: 1500,
              total: 7500,
            },
          ],
        },
      },
      include: {
        items: true,
      },
    });
  }

  return db.purchaseOrder.create({
    data: {
      businessId,
      supplier: "Auto Pjesë Albania",
      status: "RECEIVED",
      total: 35000,
      notes: "Porosi fillestare demo",
      items: {
        create: [
          {
            name: "Vaj motori 5W-30, 5L",
            quantity: 5,
            unitPrice: 3500,
            total: 17500,
          },
          {
            name: "Filtër vaji",
            quantity: 10,
            unitPrice: 1000,
            total: 10000,
          },
          {
            name: "Filtër ajri",
            quantity: 5,
            unitPrice: 1500,
            total: 7500,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });
}

async function main() {
  console.log("Duke filluar seed-in e AutoFlow...");

  const platformAdminResult = await createOrUpdatePlatformAdmin();

  console.log("Platform Admin u krijua/përditësua.");

  const business = await createOrUpdateBusiness();

  console.log(`Biznesi u krijua/përditësua: ${business.name}`);

  const ownerResult = await createOrUpdateOwner(business.id);

  console.log("Owner u krijua/përditësua dhe u lidh me biznesin.");

  const customer = await createOrUpdateCustomer(business.id);

  console.log(`Klienti u krijua/përditësua: ${customer.name}`);

  const vehicle = await createOrUpdateVehicle({
    businessId: business.id,
    customerId: customer.id,
  });

  console.log(`Automjeti u krijua/përditësua: ${vehicle.plate}`);

  const part = await createOrUpdatePart(business.id);

  console.log(`Pjesa u krijua/përditësua: ${part.name}`);

  const service = await createOrUpdateService({
    businessId: business.id,
    customerId: customer.id,
    vehicleId: vehicle.id,
  });

  console.log(`Shërbimi u krijua/përditësua: ${service.title}`);

  await createOrUpdateServicePartUsage({
    serviceId: service.id,
    partId: part.id,
  });

  console.log("Pjesa u lidh me shërbimin.");

  const invoice = await createOrUpdateInvoice({
    businessId: business.id,
    customerId: customer.id,
    vehicleId: vehicle.id,
    serviceId: service.id,
  });

  console.log(`Fatura u krijua/përditësua: ${invoice.number}`);

  const appointment = await createOrUpdateAppointment({
    businessId: business.id,
    customerId: customer.id,
    vehicleId: vehicle.id,
  });

  console.log(`Termini u krijua/përditësua: ${appointment.title}`);

  const purchaseOrder = await createOrUpdatePurchaseOrder(business.id);

  console.log(`Porosia u krijua/përditësua: ${purchaseOrder.id}`);

  console.log("");
  console.log("==========================================");
  console.log("SEED U KRYE ME SUKSES");
  console.log("==========================================");
  console.log("");
  console.log("Platform Admin:");
  console.log(`Email: ${platformAdminResult.user.email}`);
  console.log(`Password: ${platformAdminResult.password}`);
  console.log("");
  console.log("Business Owner:");
  console.log(`Email: ${ownerResult.user.email}`);
  console.log(`Password: ${ownerResult.password}`);
  console.log("");
  console.log(`Business: ${business.name}`);
  console.log(`Business ID: ${business.id}`);
  console.log("==========================================");
}

main()
  .catch((error) => {
    console.error("");
    console.error("Seed dështoi:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
