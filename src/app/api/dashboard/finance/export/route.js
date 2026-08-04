import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { parseFinancePeriod } from "@/lib/finance-period";
import { PERMISSIONS } from "@/lib/permissions";
import { getRequestId } from "@/lib/request-context";
import { buildXlsx } from "@/lib/xlsx-writer";
import { createAuditLog } from "@/services/audit-log-service";

function formatDate(value) {
  return new Date(value).toLocaleDateString("sq-AL");
}

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const context = await requireBusinessPermission(PERMISSIONS.FINANCE_EXPORT);

    const url = new URL(request.url);

    const period = parseFinancePeriod(Object.fromEntries(url.searchParams));

    const [payments, expenses, invoices, parts, purchases, movements] =
      await Promise.all([
        db.customerPayment.findMany({
          where: {
            businessId: context.businessId,
            paidAt: {
              gte: period.start,
              lte: period.end,
            },
          },
          include: {
            invoice: {
              select: {
                number: true,
              },
            },
            recordedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            paidAt: "asc",
          },
        }),

        db.businessExpense.findMany({
          where: {
            businessId: context.businessId,
            status: "POSTED",
            expenseDate: {
              gte: period.start,
              lte: period.end,
            },
          },
          include: {
            category: true,
          },
          orderBy: {
            expenseDate: "asc",
          },
        }),

        db.invoice.findMany({
          where: {
            businessId: context.businessId,
            createdAt: {
              gte: period.start,
              lte: period.end,
            },
          },
          include: {
            customer: true,
            vehicle: true,
            customerPayments: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        }),

        db.part.findMany({
          where: {
            businessId: context.businessId,
          },
          orderBy: {
            name: "asc",
          },
        }),

        db.purchaseOrder.findMany({
          where: {
            businessId: context.businessId,
            createdAt: {
              gte: period.start,
              lte: period.end,
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        }),

        db.inventoryMovement.findMany({
          where: {
            businessId: context.businessId,
            createdAt: {
              gte: period.start,
              lte: period.end,
            },
          },
          include: {
            part: true,
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        }),
      ]);

    const income = payments.reduce((sum, payment) => sum + payment.amount, 0);

    const expenseTotal = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    const purchaseTotal = purchases
      .filter((purchase) => purchase.status === "RECEIVED")
      .reduce((sum, purchase) => sum + purchase.total, 0);

    const inventoryValue = parts.reduce(
      (sum, part) => sum + part.stock * part.buyPrice,
      0,
    );

    const receivables = invoices.reduce((sum, invoice) => {
      const paid = invoice.customerPayments.reduce(
        (paymentSum, payment) => paymentSum + payment.amount,
        0,
      );

      return sum + Math.max(0, invoice.total - paid);
    }, 0);

    const sheets = [
      {
        name: "Përmbledhje",
        rows: [
          ["AutoFlow - Raport financiar", context.business.name],
          [
            "Periudha",
            `${formatDate(period.start)} - ${formatDate(period.end)}`,
          ],
          ["Të ardhura", income],
          ["Shpenzime operative", expenseTotal],
          ["Blerje të pranuara", purchaseTotal],
          ["Rezultati", income - expenseTotal - purchaseTotal],
          ["Vlera aktuale e inventarit", inventoryValue],
          ["Detyrime klientësh", receivables],
          ["Eksportuar nga", context.user.name || context.user.email],
          ["Data e eksportit", new Date().toLocaleString("sq-AL")],
        ],
      },

      {
        name: "Të ardhura",
        rows: [
          ["Data", "Fatura", "Mënyra", "Referenca", "Regjistruar nga", "Shuma"],

          ...payments.map((payment) => [
            formatDate(payment.paidAt),
            payment.invoice.number,
            payment.method,
            payment.reference || "",
            payment.recordedBy?.name || "",
            payment.amount,
          ]),

          ["TOTAL", "", "", "", "", income],
        ],
      },

      {
        name: "Shpenzime",
        rows: [
          [
            "Data",
            "Kategori",
            "Përshkrimi",
            "Furnitori",
            "Dokumenti",
            "Mënyra",
            "Shuma",
          ],

          ...expenses.map((expense) => [
            formatDate(expense.expenseDate),
            expense.category?.name || "",
            expense.description,
            expense.supplier || "",
            expense.documentNumber || "",
            expense.paymentMethod,
            expense.amount,
          ]),

          ["TOTAL", "", "", "", "", "", expenseTotal],
        ],
      },

      {
        name: "Fatura",
        rows: [
          [
            "Data",
            "Numri",
            "Klienti",
            "Automjeti",
            "Statusi",
            "Totali",
            "Paguar",
            "Mbetur",
          ],

          ...invoices.map((invoice) => {
            const paid = invoice.customerPayments.reduce(
              (sum, payment) => sum + payment.amount,
              0,
            );

            return [
              formatDate(invoice.createdAt),
              invoice.number,
              invoice.customer?.name || "",
              invoice.vehicle
                ? `${invoice.vehicle.brand} ${invoice.vehicle.plate}`
                : "",
              invoice.status,
              invoice.total,
              paid,
              Math.max(0, invoice.total - paid),
            ];
          }),
        ],
      },

      {
        name: "Inventar",
        rows: [
          [
            "Kodi",
            "Pjesa",
            "Kategoria",
            "Furnitori",
            "Sasia",
            "Kosto",
            "Vlera",
            "Minimumi",
          ],

          ...parts.map((part) => [
            part.code || "",
            part.name,
            part.category || "",
            part.supplier || "",
            part.stock,
            part.buyPrice,
            part.stock * part.buyPrice,
            part.minStock,
          ]),

          ["TOTAL", "", "", "", "", "", inventoryValue, ""],
        ],
      },

      {
        name: "Porosi",
        rows: [
          ["Data", "Furnitori", "Statusi", "Totali", "Shënime"],

          ...purchases.map((purchase) => [
            formatDate(purchase.createdAt),
            purchase.supplier,
            purchase.status,
            purchase.total,
            purchase.notes || "",
          ]),

          ["TOTAL", "", "", purchaseTotal, ""],
        ],
      },

      {
        name: "Lëvizje stoku",
        rows: [
          [
            "Data",
            "Pjesa",
            "Lloji",
            "Sasia",
            "Para",
            "Pas",
            "Përdoruesi",
            "Shënim",
          ],

          ...movements.map((movement) => [
            formatDate(movement.createdAt),
            movement.part.name,
            movement.type,
            movement.quantity,
            movement.stockBefore,
            movement.stockAfter,
            movement.user?.name || "",
            movement.note || "",
          ]),
        ],
      },
    ];

    const bytes = buildXlsx(sheets);

    const fileName =
      `autoflow-raport-` + `${period.startInput}-` + `${period.endInput}.xlsx`;

    await db.financialReportExport.create({
      data: {
        businessId: context.businessId,
        userId: context.userId,
        reportType: "FULL",
        periodStart: period.start,
        periodEnd: period.end,
        fileName,
      },
    });

    await createAuditLog({
      businessId: context.businessId,
      userId: context.userId,
      action: "EXPORT",
      entityType: "FinancialReport",
      title: "U eksportua raporti financiar",
      description: fileName,
      metadata: {
        periodStart: period.start,
        periodEnd: period.end,
      },
    });

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
        "x-request-id": requestId,
      },
    });
  } catch (error) {
    return apiError(error, {
      request,
      requestId,
      fallbackMessage: "Raporti financiar nuk mund të eksportohej.",
    });
  }
}
