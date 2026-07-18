"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";

const ALLOWED_STATUSES = ["DRAFT", "UNPAID", "PAID", "OVERDUE"];

function normalizeOptionalId(value) {
  const normalizedValue = String(value || "").trim();

  return normalizedValue || null;
}

function normalizeStatus(value) {
  const status = String(value || "DRAFT")
    .trim()
    .toUpperCase();

  if (!ALLOWED_STATUSES.includes(status)) {
    return "DRAFT";
  }

  return status;
}

function revalidateInvoicePaths(invoiceId = null) {
  revalidatePath("/dashboard/invoices");

  if (invoiceId) {
    revalidatePath(`/dashboard/invoices/${invoiceId}`);
  }

  revalidatePath("/dashboard/customers");
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard");
}

async function getActiveBusiness() {
  const business = await db.business.findFirst({
    select: {
      id: true,
    },
  });

  if (!business) {
    throw new Error("Nuk u gjet biznes aktiv.");
  }

  return business;
}

async function generateInvoiceNumber(businessId) {
  const currentYear = new Date().getFullYear();

  const invoices = await db.invoice.findMany({
    where: {
      businessId,
      number: {
        startsWith: `INV-${currentYear}-`,
      },
    },
    select: {
      number: true,
    },
  });

  let highestNumber = 0;

  for (const invoice of invoices) {
    const numberParts = invoice.number.split("-");
    const sequence = Number(numberParts[numberParts.length - 1]);

    if (Number.isInteger(sequence) && sequence > highestNumber) {
      highestNumber = sequence;
    }
  }

  const nextNumber = String(highestNumber + 1).padStart(4, "0");

  return `INV-${currentYear}-${nextNumber}`;
}

async function getServiceData(serviceId, businessId) {
  if (!serviceId) {
    return null;
  }

  const service = await db.serviceRecord.findFirst({
    where: {
      id: serviceId,
      businessId,
    },
    select: {
      id: true,
      customerId: true,
      vehicleId: true,
      total: true,
    },
  });

  if (!service) {
    throw new Error("Shërbimi i zgjedhur nuk u gjet.");
  }

  return service;
}

function getErrorMessage(error) {
  if (error?.code === "P2002") {
    const target = Array.isArray(error?.meta?.target)
      ? error.meta.target.join(", ")
      : String(error?.meta?.target || "");

    if (target.includes("serviceId")) {
      return "Për këtë shërbim ekziston tashmë një faturë.";
    }

    if (target.includes("number")) {
      return "Ekziston tashmë një faturë me këtë numër.";
    }

    return "Ekziston tashmë një rekord me këto të dhëna.";
  }

  return error?.message || "Ndodhi një gabim i papritur.";
}

export async function createInvoice(formData) {
  try {
    const business = await getActiveBusiness();

    const selectedCustomerId = normalizeOptionalId(formData.get("customerId"));

    const selectedVehicleId = normalizeOptionalId(formData.get("vehicleId"));

    const serviceId = normalizeOptionalId(formData.get("serviceId"));

    const requestedNumber = String(formData.get("number") || "").trim();

    const requestedTotal = String(formData.get("total") || "").trim();

    const status = normalizeStatus(formData.get("status"));

    let customerId = selectedCustomerId;
    let vehicleId = selectedVehicleId;
    let total = Number(requestedTotal);

    if (serviceId) {
      const existingInvoice = await db.invoice.findUnique({
        where: {
          serviceId,
        },
        select: {
          id: true,
          number: true,
        },
      });

      if (existingInvoice) {
        return {
          success: false,
          message: `Për këtë shërbim ekziston tashmë fatura ${existingInvoice.number}.`,
        };
      }

      const service = await getServiceData(serviceId, business.id);

      customerId = service.customerId || customerId;
      vehicleId = service.vehicleId || vehicleId;
      total = Number(service.total || 0);
    }

    if (!serviceId && (!requestedTotal || !Number.isFinite(total))) {
      return {
        success: false,
        message: "Totali i faturës është i detyrueshëm.",
      };
    }

    if (total < 0) {
      return {
        success: false,
        message: "Totali i faturës nuk mund të jetë negativ.",
      };
    }

    const number =
      requestedNumber || (await generateInvoiceNumber(business.id));

    const duplicateNumber = await db.invoice.findFirst({
      where: {
        businessId: business.id,
        number,
      },
      select: {
        id: true,
      },
    });

    if (duplicateNumber) {
      return {
        success: false,
        message: "Ekziston tashmë një faturë me këtë numër.",
      };
    }

    const invoice = await db.invoice.create({
      data: {
        businessId: business.id,
        customerId,
        vehicleId,
        serviceId,
        number,
        status,
        total,
      },
      select: {
        id: true,
        number: true,
      },
    });

    revalidateInvoicePaths(invoice.id);

    return {
      success: true,
      message: "Fatura u krijua me sukses.",
      invoice,
    };
  } catch (error) {
    console.error("createInvoice error:", error);

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function updateInvoice(invoiceId, formData) {
  try {
    if (!invoiceId) {
      return {
        success: false,
        message: "ID-ja e faturës mungon.",
      };
    }

    const business = await getActiveBusiness();

    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        businessId: business.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingInvoice) {
      return {
        success: false,
        message: "Fatura nuk u gjet.",
      };
    }

    const selectedCustomerId = normalizeOptionalId(formData.get("customerId"));

    const selectedVehicleId = normalizeOptionalId(formData.get("vehicleId"));

    const serviceId = normalizeOptionalId(formData.get("serviceId"));

    const number = String(formData.get("number") || "").trim();

    const requestedTotal = String(formData.get("total") || "").trim();

    const status = normalizeStatus(formData.get("status"));

    if (!number) {
      return {
        success: false,
        message: "Numri i faturës është i detyrueshëm.",
      };
    }

    const duplicateNumber = await db.invoice.findFirst({
      where: {
        businessId: business.id,
        number,
        NOT: {
          id: invoiceId,
        },
      },
      select: {
        id: true,
      },
    });

    if (duplicateNumber) {
      return {
        success: false,
        message: "Ekziston tashmë një faturë me këtë numër.",
      };
    }

    let customerId = selectedCustomerId;
    let vehicleId = selectedVehicleId;
    let total = Number(requestedTotal);

    if (serviceId) {
      const serviceInvoice = await db.invoice.findFirst({
        where: {
          serviceId,
          NOT: {
            id: invoiceId,
          },
        },
        select: {
          id: true,
          number: true,
        },
      });

      if (serviceInvoice) {
        return {
          success: false,
          message: `Për këtë shërbim ekziston tashmë fatura ${serviceInvoice.number}.`,
        };
      }

      const service = await getServiceData(serviceId, business.id);

      customerId = service.customerId || customerId;
      vehicleId = service.vehicleId || vehicleId;
      total = Number(service.total || 0);
    }

    if (!serviceId && (!requestedTotal || !Number.isFinite(total))) {
      return {
        success: false,
        message: "Totali i faturës është i detyrueshëm.",
      };
    }

    if (total < 0) {
      return {
        success: false,
        message: "Totali i faturës nuk mund të jetë negativ.",
      };
    }

    await db.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        customerId,
        vehicleId,
        serviceId,
        number,
        status,
        total,
      },
    });

    revalidateInvoicePaths(invoiceId);

    return {
      success: true,
      message: "Fatura u përditësua me sukses.",
    };
  } catch (error) {
    console.error("updateInvoice error:", error);

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function updateInvoiceStatus(invoiceId, status) {
  try {
    if (!invoiceId) {
      return {
        success: false,
        message: "ID-ja e faturës mungon.",
      };
    }

    const normalizedStatus = String(status || "")
      .trim()
      .toUpperCase();

    if (!ALLOWED_STATUSES.includes(normalizedStatus)) {
      return {
        success: false,
        message: "Statusi i zgjedhur nuk është i vlefshëm.",
      };
    }

    const business = await getActiveBusiness();

    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        businessId: business.id,
      },
      select: {
        id: true,
      },
    });

    if (!invoice) {
      return {
        success: false,
        message: "Fatura nuk u gjet.",
      };
    }

    await db.invoice.update({
      where: {
        id: invoiceId,
      },
      data: {
        status: normalizedStatus,
      },
    });

    revalidateInvoicePaths(invoiceId);

    return {
      success: true,
      message:
        normalizedStatus === "PAID"
          ? "Fatura u shënua si e paguar."
          : "Statusi i faturës u ndryshua me sukses.",
    };
  } catch (error) {
    console.error("updateInvoiceStatus error:", error);

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteInvoice(invoiceId) {
  try {
    if (!invoiceId) {
      return {
        success: false,
        message: "ID-ja e faturës mungon.",
      };
    }

    const business = await getActiveBusiness();

    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        businessId: business.id,
      },
      select: {
        id: true,
      },
    });

    if (!invoice) {
      return {
        success: false,
        message: "Fatura nuk u gjet.",
      };
    }

    await db.invoice.delete({
      where: {
        id: invoiceId,
      },
    });

    revalidateInvoicePaths(invoiceId);

    return {
      success: true,
      message: "Fatura u fshi me sukses.",
    };
  } catch (error) {
    console.error("deleteInvoice error:", error);

    return {
      success: false,
      message: getErrorMessage(error),
    };
  }
}
