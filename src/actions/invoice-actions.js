"use server";

import { revalidatePath } from "next/cache";

import {
  requireAnyBusinessActionPermission,
  requireBusinessActionPermission,
} from "@/lib/business-context";
import { db } from "@/lib/db";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import {
  createInvoiceSchema,
  deleteInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
} from "@/schemas/invoice-schema";
import {
  logCreate,
  logDelete,
  logPayment,
  logStatusChange,
  logUpdate,
} from "@/services/audit-events";

import { createActionError } from "@/lib/errors";
function getStatusLabel(status) {
  const labels = {
    DRAFT: "Draft",
    UNPAID: "E papaguar",
    PAID: "E paguar",
    OVERDUE: "Me vonesë",
  };

  return labels[status] || status;
}

function getInvoiceAuditValues(invoice) {
  if (!invoice) {
    return null;
  }

  return {
    id: invoice.id,
    customerId: invoice.customerId,
    vehicleId: invoice.vehicleId,
    serviceId: invoice.serviceId,
    number: invoice.number,
    status: invoice.status,
    total: invoice.total,
  };
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
    throw createActionError("Shërbimi i zgjedhur nuk u gjet.");
  }

  return service;
}

async function validateCustomer(customerId, businessId) {
  if (!customerId) {
    return null;
  }

  const customer = await db.customer.findFirst({
    where: {
      id: customerId,
      businessId,
    },

    select: {
      id: true,
    },
  });

  if (!customer) {
    throw createActionError("Klienti i zgjedhur nuk u gjet.");
  }

  return customer.id;
}

async function validateVehicle(vehicleId, businessId) {
  if (!vehicleId) {
    return null;
  }

  const vehicle = await db.vehicle.findFirst({
    where: {
      id: vehicleId,
      businessId,
    },

    select: {
      id: true,
      customerId: true,
    },
  });

  if (!vehicle) {
    throw createActionError("Automjeti i zgjedhur nuk u gjet.");
  }

  return vehicle;
}

function validateServiceTotal(value) {
  const total = Number(value);

  if (!Number.isFinite(total)) {
    throw createActionError("Totali i faturës nuk është i vlefshëm.");
  }

  if (total < 0) {
    throw createActionError("Totali i faturës nuk mund të jetë negativ.");
  }

  return total;
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

  if (error?.code === "P2003") {
    return "Të dhënat e zgjedhura nuk janë më të vlefshme.";
  }

  return error?.message || "Ndodhi një gabim i papritur.";
}

export async function createInvoice(formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.INVOICES_CREATE,
    );

    const { businessId } = context;

    const validationResult = validateFormData(createInvoiceSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Fatura nuk mund të krijohej.",
        ),
      };
    }

    const {
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      serviceId,
      number: requestedNumber,
      total: validatedManualTotal,
      status,
    } = validationResult.data;

    let customerId = selectedCustomerId;
    let vehicleId = selectedVehicleId;
    let total;

    if (serviceId) {
      const existingInvoice = await db.invoice.findFirst({
        where: {
          businessId,
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

      const service = await getServiceData(serviceId, businessId);

      customerId = service.customerId || customerId;

      vehicleId = service.vehicleId || vehicleId;

      total = validateServiceTotal(service.total || 0);
    } else {
      total = validatedManualTotal;
    }

    const validatedVehicle = await validateVehicle(vehicleId, businessId);

    const validatedCustomerId = await validateCustomer(customerId, businessId);

    if (
      validatedVehicle?.customerId &&
      validatedCustomerId &&
      validatedVehicle.customerId !== validatedCustomerId
    ) {
      return {
        success: false,

        message: "Automjeti i zgjedhur nuk i përket klientit të zgjedhur.",
      };
    }

    customerId = validatedCustomerId;
    vehicleId = validatedVehicle?.id || null;

    const number = requestedNumber || (await generateInvoiceNumber(businessId));

    const duplicateNumber = await db.invoice.findFirst({
      where: {
        businessId,
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

    let createdInvoice = null;

    await db.$transaction(async (transaction) => {
      const invoice = await transaction.invoice.create({
        data: {
          businessId,
          customerId,
          vehicleId,
          serviceId,
          number,
          status,
          total,
        },

        select: {
          id: true,
          customerId: true,
          vehicleId: true,
          serviceId: true,
          number: true,
          status: true,
          total: true,
        },
      });

      createdInvoice = invoice;

      await logCreate({
        context,
        entityType: "INVOICE",
        entityId: invoice.id,
        title: `U krijua fatura ${invoice.number}`,

        description: `Fatura "${invoice.number}" me total ${invoice.total} u krijua me statusin "${getStatusLabel(
          invoice.status,
        )}".`,

        newValues: getInvoiceAuditValues(invoice),

        metadata: {
          source: "invoice-actions",
          operation: "createInvoice",
        },

        database: transaction,
      });

      if (invoice.status === "PAID") {
        await logPayment({
          context,
          entityType: "INVOICE",
          entityId: invoice.id,

          title: `U regjistrua pagesa për faturën ${invoice.number}`,

          description: `Fatura "${invoice.number}" u krijua drejtpërdrejt si e paguar.`,

          amount: invoice.total,

          metadata: {
            source: "invoice-actions",
            operation: "createInvoice",
            invoiceNumber: invoice.number,
          },

          database: transaction,
        });
      }
    });

    revalidateInvoicePaths(createdInvoice.id);

    return {
      success: true,
      message: "Fatura u krijua me sukses.",

      invoice: {
        id: createdInvoice.id,
        number: createdInvoice.number,
      },
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
    const context = await requireBusinessActionPermission(
      PERMISSIONS.INVOICES_UPDATE,
    );

    const { businessId } = context;

    const idValidationResult = validateObject(deleteInvoiceSchema, {
      invoiceId,
    });

    if (!idValidationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          idValidationResult.error,
          "ID-ja e faturës mungon.",
        ),
      };
    }

    const validatedInvoiceId = idValidationResult.data.invoiceId;

    const validationResult = validateFormData(updateInvoiceSchema, formData);

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Fatura nuk mund të përditësohej.",
        ),
      };
    }

    const {
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      serviceId,
      number,
      total: validatedManualTotal,
      status,
    } = validationResult.data;

    const existingInvoice = await db.invoice.findFirst({
      where: {
        id: validatedInvoiceId,
        businessId,
      },

      select: {
        id: true,
        customerId: true,
        vehicleId: true,
        serviceId: true,
        number: true,
        status: true,
        total: true,
      },
    });

    if (!existingInvoice) {
      return {
        success: false,
        message: "Fatura nuk u gjet.",
      };
    }

    const duplicateNumber = await db.invoice.findFirst({
      where: {
        businessId,
        number,

        NOT: {
          id: existingInvoice.id,
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
    let total;

    if (serviceId) {
      const serviceInvoice = await db.invoice.findFirst({
        where: {
          businessId,
          serviceId,

          NOT: {
            id: existingInvoice.id,
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

      const service = await getServiceData(serviceId, businessId);

      customerId = service.customerId || customerId;

      vehicleId = service.vehicleId || vehicleId;

      total = validateServiceTotal(service.total || 0);
    } else {
      total = validatedManualTotal;
    }

    const validatedVehicle = await validateVehicle(vehicleId, businessId);

    const validatedCustomerId = await validateCustomer(customerId, businessId);

    if (
      validatedVehicle?.customerId &&
      validatedCustomerId &&
      validatedVehicle.customerId !== validatedCustomerId
    ) {
      return {
        success: false,

        message: "Automjeti i zgjedhur nuk i përket klientit të zgjedhur.",
      };
    }

    customerId = validatedCustomerId;
    vehicleId = validatedVehicle?.id || null;

    await db.$transaction(async (transaction) => {
      const updatedInvoice = await transaction.invoice.update({
        where: {
          id: existingInvoice.id,
        },

        data: {
          customerId,
          vehicleId,
          serviceId,
          number,
          status,
          total,
        },

        select: {
          id: true,
          customerId: true,
          vehicleId: true,
          serviceId: true,
          number: true,
          status: true,
          total: true,
        },
      });

      await logUpdate({
        context,
        entityType: "INVOICE",
        entityId: updatedInvoice.id,

        title: `U përditësua fatura ${updatedInvoice.number}`,

        description: `Të dhënat e faturës "${updatedInvoice.number}" u përditësuan.`,

        oldValues: getInvoiceAuditValues(existingInvoice),

        newValues: getInvoiceAuditValues(updatedInvoice),

        metadata: {
          source: "invoice-actions",
          operation: "updateInvoice",
        },

        database: transaction,
      });

      if (existingInvoice.status !== updatedInvoice.status) {
        await logStatusChange({
          context,
          entityType: "INVOICE",
          entityId: updatedInvoice.id,

          title: `Ndryshoi statusi i faturës ${updatedInvoice.number}`,

          description: `Statusi ndryshoi nga "${getStatusLabel(
            existingInvoice.status,
          )}" në "${getStatusLabel(updatedInvoice.status)}".`,

          oldStatus: existingInvoice.status,
          newStatus: updatedInvoice.status,

          metadata: {
            source: "invoice-actions",
            operation: "updateInvoice",
            invoiceNumber: updatedInvoice.number,
          },

          database: transaction,
        });

        if (updatedInvoice.status === "PAID") {
          await logPayment({
            context,
            entityType: "INVOICE",
            entityId: updatedInvoice.id,

            title: `U regjistrua pagesa për faturën ${updatedInvoice.number}`,

            description: `Fatura "${updatedInvoice.number}" u shënua si e paguar.`,

            amount: updatedInvoice.total,

            metadata: {
              source: "invoice-actions",
              operation: "updateInvoice",
              invoiceNumber: updatedInvoice.number,
              previousStatus: existingInvoice.status,
            },

            database: transaction,
          });
        }
      }
    });

    revalidateInvoicePaths(existingInvoice.id);

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
    const context = await requireAnyBusinessActionPermission([
      PERMISSIONS.INVOICES_UPDATE,
      PERMISSIONS.INVOICES_MARK_PAID,
    ]);

    const { businessId } = context;

    const validationResult = validateObject(updateInvoiceStatusSchema, {
      invoiceId,
      status,
    });

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "Statusi i zgjedhur nuk është i vlefshëm.",
        ),
      };
    }

    const { invoiceId: validatedInvoiceId, status: normalizedStatus } =
      validationResult.data;

    const invoice = await db.invoice.findFirst({
      where: {
        id: validatedInvoiceId,
        businessId,
      },

      select: {
        id: true,
        customerId: true,
        vehicleId: true,
        serviceId: true,
        number: true,
        status: true,
        total: true,
      },
    });

    if (!invoice) {
      return {
        success: false,
        message: "Fatura nuk u gjet.",
      };
    }

    if (invoice.status === normalizedStatus) {
      return {
        success: true,

        message:
          normalizedStatus === "PAID"
            ? "Fatura është tashmë e paguar."
            : "Statusi është tashmë i përditësuar.",
      };
    }

    await db.$transaction(async (transaction) => {
      const updatedInvoice = await transaction.invoice.update({
        where: {
          id: invoice.id,
        },

        data: {
          status: normalizedStatus,
        },

        select: {
          id: true,
          customerId: true,
          vehicleId: true,
          serviceId: true,
          number: true,
          status: true,
          total: true,
        },
      });

      await logStatusChange({
        context,
        entityType: "INVOICE",
        entityId: updatedInvoice.id,

        title: `Ndryshoi statusi i faturës ${updatedInvoice.number}`,

        description: `Statusi i faturës "${updatedInvoice.number}" ndryshoi nga "${getStatusLabel(
          invoice.status,
        )}" në "${getStatusLabel(updatedInvoice.status)}".`,

        oldStatus: invoice.status,
        newStatus: updatedInvoice.status,

        metadata: {
          source: "invoice-actions",
          operation: "updateInvoiceStatus",
          invoiceNumber: updatedInvoice.number,
        },

        database: transaction,
      });

      if (updatedInvoice.status === "PAID") {
        await logPayment({
          context,
          entityType: "INVOICE",
          entityId: updatedInvoice.id,

          title: `U regjistrua pagesa për faturën ${updatedInvoice.number}`,

          description: `Fatura "${updatedInvoice.number}" u shënua si e paguar me total ${updatedInvoice.total}.`,

          amount: updatedInvoice.total,

          metadata: {
            source: "invoice-actions",
            operation: "updateInvoiceStatus",
            invoiceNumber: updatedInvoice.number,
            previousStatus: invoice.status,
          },

          database: transaction,
        });
      }
    });

    revalidateInvoicePaths(invoice.id);

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
    const context = await requireBusinessActionPermission(
      PERMISSIONS.INVOICES_DELETE,
    );

    const { businessId } = context;

    const validationResult = validateObject(deleteInvoiceSchema, {
      invoiceId,
    });

    if (!validationResult.success) {
      return {
        success: false,

        message: getFirstValidationMessage(
          validationResult.error,
          "ID-ja e faturës mungon.",
        ),
      };
    }

    const validatedInvoiceId = validationResult.data.invoiceId;

    const invoice = await db.invoice.findFirst({
      where: {
        id: validatedInvoiceId,
        businessId,
      },

      select: {
        id: true,
        customerId: true,
        vehicleId: true,
        serviceId: true,
        number: true,
        status: true,
        total: true,
      },
    });

    if (!invoice) {
      return {
        success: false,
        message: "Fatura nuk u gjet.",
      };
    }

    await db.$transaction(async (transaction) => {
      await transaction.invoice.delete({
        where: {
          id: invoice.id,
        },
      });

      await logDelete({
        context,
        entityType: "INVOICE",
        entityId: invoice.id,

        title: `U fshi fatura ${invoice.number}`,

        description: `Fatura "${invoice.number}" me total ${invoice.total} dhe status "${getStatusLabel(
          invoice.status,
        )}" u fshi nga sistemi.`,

        oldValues: getInvoiceAuditValues(invoice),

        metadata: {
          source: "invoice-actions",
          operation: "deleteInvoice",
          invoiceNumber: invoice.number,
        },

        database: transaction,
      });
    });

    revalidateInvoicePaths(invoice.id);

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
