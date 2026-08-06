"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireBusinessActionPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { createActionError } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import {
  getFirstValidationMessage,
  validateFormData,
  validateObject,
} from "@/lib/validation";
import { createAuditLog } from "@/services/audit-log-service";

const requiredTextSchema = z
  .string()
  .trim()
  .min(1, "Kjo fushë është e detyrueshme.");

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

const positiveAmountSchema = z.coerce
  .number({
    error: "Shuma nuk është e vlefshme.",
  })
  .finite("Shuma nuk është e vlefshme.")
  .positive("Shuma duhet të jetë më e madhe se zero.");

const dateSchema = z
  .string()
  .trim()
  .min(1, "Data është e detyrueshme.")
  .transform((value, context) => {
    const date = new Date(`${value}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      context.addIssue({
        code: "custom",
        message: "Data nuk është e vlefshme.",
      });

      return z.NEVER;
    }

    return date;
  });

const createExpenseSchema = z.object({
  description: requiredTextSchema,
  amount: positiveAmountSchema,
  expenseDate: dateSchema,
  categoryId: optionalTextSchema,
  newCategory: optionalTextSchema,
  supplier: optionalTextSchema,
  documentNumber: optionalTextSchema,
  paymentMethod: z
    .string()
    .trim()
    .transform((value) => value || "CASH"),
  notes: optionalTextSchema,
});

const createInventoryCountSchema = z.object({
  name: optionalTextSchema,
  periodType: z
    .string()
    .trim()
    .transform((value) => value || "MONTHLY"),
  countDate: dateSchema,
  notes: optionalTextSchema,
});

const inventoryCountIdSchema = z.object({
  inventoryCountId: requiredTextSchema,
});

const inventoryCountItemSchema = z.object({
  actualQuantity: z.coerce
    .number({
      error: "Sasia reale nuk është e vlefshme.",
    })
    .finite("Sasia reale nuk është e vlefshme.")
    .int("Sasia reale duhet të jetë numër i plotë.")
    .min(0, "Sasia reale nuk mund të jetë negative."),
  note: optionalTextSchema,
});

function getValidationError(validationResult, fallbackMessage) {
  return createActionError(
    getFirstValidationMessage(validationResult.error, fallbackMessage),
  );
}

function revalidateFinancePages() {
  revalidatePath("/dashboard/finance");
  revalidatePath("/dashboard/finance/expenses");
}

function revalidateInventoryCountPage(inventoryCountId) {
  revalidatePath(`/dashboard/finance/inventory-counts/${inventoryCountId}`);
}

export async function createExpenseAction(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.FINANCE_MANAGE,
  );

  const validationResult = validateFormData(createExpenseSchema, formData);

  if (!validationResult.success) {
    throw getValidationError(
      validationResult,
      "Plotëso përshkrimin, shumën dhe datën.",
    );
  }

  const {
    description,
    amount,
    expenseDate,
    categoryId: submittedCategoryId,
    newCategory,
    supplier,
    documentNumber,
    paymentMethod,
    notes,
  } = validationResult.data;

  let categoryId = submittedCategoryId;

  if (newCategory) {
    const category = await db.expenseCategory.upsert({
      where: {
        businessId_name: {
          businessId: context.businessId,
          name: newCategory,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        businessId: context.businessId,
        name: newCategory,
      },
    });

    categoryId = category.id;
  }

  const expense = await db.businessExpense.create({
    data: {
      businessId: context.businessId,
      recordedById: context.userId,
      categoryId,
      description,
      supplier,
      documentNumber,
      amount,
      paymentMethod,
      expenseDate,
      notes,
    },
  });

  await createAuditLog({
    businessId: context.businessId,
    userId: context.userId,
    action: "CREATE",
    entityType: "BusinessExpense",
    entityId: expense.id,
    title: "U regjistrua shpenzim",
    description: `${expense.description}: ${amount} ALL`,
    newValues: {
      amount,
      expenseDate,
    },
  });

  revalidateFinancePages();

  redirect("/dashboard/finance/expenses?created=1");
}

export async function createInventoryCountAction(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.INVENTORY_COUNTS_MANAGE,
  );

  const validationResult = validateFormData(
    createInventoryCountSchema,
    formData,
  );

  if (!validationResult.success) {
    throw getValidationError(
      validationResult,
      "Plotëso të dhënat e inventarizimit.",
    );
  }

  const { name, periodType, countDate, notes } = validationResult.data;

  const parts = await db.part.findMany({
    where: {
      businessId: context.businessId,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (!parts.length) {
    throw createActionError("Nuk ka pjesë në inventar.");
  }

  const count = await db.inventoryCount.create({
    data: {
      businessId: context.businessId,
      createdById: context.userId,
      name: name || `Inventarizim ${new Date().toLocaleDateString("sq-AL")}`,
      periodType,
      countDate,
      notes,
      items: {
        create: parts.map((part) => ({
          partId: part.id,
          partName: part.name,
          partCode: part.code,
          expectedQuantity: part.stock,
          unitCost: part.buyPrice,
          expectedValue: part.stock * part.buyPrice,
        })),
      },
    },
  });

  await createAuditLog({
    businessId: context.businessId,
    userId: context.userId,
    action: "CREATE",
    entityType: "InventoryCount",
    entityId: count.id,
    title: "U krijua inventarizim",
    description: count.name,
  });

  redirect(`/dashboard/finance/inventory-counts/${count.id}`);
}

export async function saveInventoryCountAction(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.INVENTORY_COUNTS_MANAGE,
  );

  const idValidationResult = validateFormData(inventoryCountIdSchema, formData);

  if (!idValidationResult.success) {
    throw getValidationError(
      idValidationResult,
      "Inventarizimi nuk u identifikua.",
    );
  }

  const { inventoryCountId } = idValidationResult.data;

  const count = await db.inventoryCount.findFirst({
    where: {
      id: inventoryCountId,
      businessId: context.businessId,
    },
    include: {
      items: true,
    },
  });

  if (!count || count.status !== "DRAFT") {
    throw createActionError("Inventarizimi nuk mund të ndryshohet.");
  }

  const updateOperations = count.items.map((item) => {
    const itemValidationResult = validateObject(inventoryCountItemSchema, {
      actualQuantity:
        formData.get(`actual_${item.id}`) ?? item.expectedQuantity,
      note: formData.get(`note_${item.id}`) ?? "",
    });

    if (!itemValidationResult.success) {
      throw getValidationError(
        itemValidationResult,
        `Sasia reale për artikullin “${item.partName}” nuk është e vlefshme.`,
      );
    }

    const { actualQuantity, note } = itemValidationResult.data;

    const difference = actualQuantity - item.expectedQuantity;

    return db.inventoryCountItem.update({
      where: {
        id: item.id,
      },
      data: {
        actualQuantity,
        difference,
        actualValue: actualQuantity * item.unitCost,
        differenceValue: difference * item.unitCost,
        note,
      },
    });
  });

  await db.$transaction(updateOperations);

  revalidateInventoryCountPage(inventoryCountId);
}

export async function submitInventoryCountAction(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.INVENTORY_COUNTS_MANAGE,
  );

  const validationResult = validateFormData(inventoryCountIdSchema, formData);

  if (!validationResult.success) {
    throw getValidationError(
      validationResult,
      "Inventarizimi nuk u identifikua.",
    );
  }

  const { inventoryCountId } = validationResult.data;

  const count = await db.inventoryCount.findFirst({
    where: {
      id: inventoryCountId,
      businessId: context.businessId,
    },
    include: {
      items: true,
    },
  });

  if (
    !count ||
    count.status !== "DRAFT" ||
    count.items.some((item) => item.actualQuantity === null)
  ) {
    throw createActionError("Plotëso sasitë reale para dërgimit për shqyrtim.");
  }

  await db.inventoryCount.update({
    where: {
      id: inventoryCountId,
    },
    data: {
      status: "IN_REVIEW",
      submittedAt: new Date(),
    },
  });

  await createAuditLog({
    businessId: context.businessId,
    userId: context.userId,
    action: "STATUS_CHANGE",
    entityType: "InventoryCount",
    entityId: inventoryCountId,
    title: "Inventarizimi u dërgua për shqyrtim",
    description: count.name,
    oldValues: { status: "DRAFT" },
    newValues: { status: "IN_REVIEW" },
  });

  revalidateInventoryCountPage(inventoryCountId);
}

export async function approveInventoryCountAction(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.INVENTORY_COUNTS_APPROVE,
  );

  const validationResult = validateFormData(inventoryCountIdSchema, formData);

  if (!validationResult.success) {
    throw getValidationError(
      validationResult,
      "Inventarizimi nuk u identifikua.",
    );
  }

  const { inventoryCountId } = validationResult.data;

  const count = await db.inventoryCount.findFirst({
    where: {
      id: inventoryCountId,
      businessId: context.businessId,
      status: "IN_REVIEW",
    },
  });

  if (!count) {
    throw createActionError("Inventarizimi nuk është në shqyrtim.");
  }

  await db.inventoryCount.update({
    where: {
      id: inventoryCountId,
    },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedById: context.userId,
    },
  });

  await createAuditLog({
    businessId: context.businessId,
    userId: context.userId,
    action: "STATUS_CHANGE",
    entityType: "InventoryCount",
    entityId: inventoryCountId,
    title: "Inventarizimi u aprovua",
    description: count.name,
    oldValues: { status: "IN_REVIEW" },
    newValues: { status: "APPROVED", approvedById: context.userId },
  });

  revalidateInventoryCountPage(inventoryCountId);
}

export async function postInventoryCountAction(formData) {
  const context = await requireBusinessActionPermission(
    PERMISSIONS.INVENTORY_COUNTS_APPROVE,
  );

  const validationResult = validateFormData(inventoryCountIdSchema, formData);

  if (!validationResult.success) {
    throw getValidationError(
      validationResult,
      "Inventarizimi nuk u identifikua.",
    );
  }

  const { inventoryCountId } = validationResult.data;

  const count = await db.inventoryCount.findFirst({
    where: {
      id: inventoryCountId,
      businessId: context.businessId,
      status: "APPROVED",
    },
    include: {
      items: true,
    },
  });

  if (!count) {
    throw createActionError("Inventarizimi nuk është aprovuar.");
  }

  const postingResult = await db.$transaction(async (transaction) => {
    const claimedCount = await transaction.inventoryCount.updateMany({
      where: {
        id: inventoryCountId,
        businessId: context.businessId,
        status: "APPROVED",
        postedAt: null,
      },
      data: {
        status: "POSTED",
        postedAt: new Date(),
      },
    });

    if (claimedCount.count !== 1) {
      throw createActionError(
        "Inventarizimi është postuar tashmë ose nuk është më i aprovuar.",
      );
    }

    let adjustedItems = 0;

    for (const item of count.items) {
      if (item.actualQuantity === null) {
        continue;
      }

      const part = await transaction.part.findFirst({
        where: {
          id: item.partId,
          businessId: context.businessId,
        },
      });

      if (!part || part.stock === item.actualQuantity) {
        continue;
      }

      const difference = item.actualQuantity - part.stock;

      await transaction.part.update({
        where: {
          id: part.id,
        },
        data: {
          stock: item.actualQuantity,
        },
      });

      await transaction.inventoryMovement.create({
        data: {
          businessId: context.businessId,
          partId: part.id,
          userId: context.userId,
          type: difference > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
          quantity: Math.abs(difference),
          stockBefore: part.stock,
          stockAfter: item.actualQuantity,
          note: `Korrigjim nga ${count.name}`,
        },
      });

      adjustedItems += 1;
    }

    return { adjustedItems };
  });

  await createAuditLog({
    businessId: context.businessId,
    userId: context.userId,
    action: "STATUS_CHANGE",
    entityType: "InventoryCount",
    entityId: inventoryCountId,
    title: "Inventarizimi u postua",
    description: count.name,
    oldValues: { status: "APPROVED" },
    newValues: { status: "POSTED" },
    metadata: { adjustedItems: postingResult.adjustedItems },
  });

  revalidatePath("/dashboard/inventory");
  revalidatePath("/dashboard/inventory/movements");
  revalidateInventoryCountPage(inventoryCountId);
}
