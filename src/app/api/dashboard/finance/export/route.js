import { NextResponse } from "next/server";

import { apiError } from "@/lib/api-response";
import { requireBusinessApiPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  calculateFinanceResults,
  getInvoiceCogs,
  getInvoiceNetRevenue,
  sumInvoiceCogs,
  sumInvoiceNetRevenue,
  sumInvoiceTotals,
} from "@/lib/finance-metrics";
import { parseFinancePeriod } from "@/lib/finance-period";
import {
  addMoney,
  moneyToNumber,
  multiplyMoney,
  subtractMoney,
  toMoney,
} from "@/lib/money";
import { PERMISSIONS } from "@/lib/permissions";
import { getRequestId } from "@/lib/request-context";
import { buildXlsx } from "@/lib/xlsx-writer";
import { createAuditLog } from "@/services/audit-log-service";

function formatDate(value) {
  return new Date(value).toLocaleDateString("sq-AL");
}

function nonNegativeMoney(value) {
  const decimalValue = toMoney(value);

  return decimalValue.lt(0)
    ? toMoney(0)
    : decimalValue;
}

export async function GET(request) {
  const requestId = getRequestId(request);

  try {
    const context =
      await requireBusinessApiPermission(
        PERMISSIONS.FINANCE_EXPORT,
      );

    const url = new URL(request.url);

    const period = parseFinancePeriod(
      Object.fromEntries(
        url.searchParams,
      ),
    );

    const [
      payments,
      expenses,
      invoices,
      parts,
      purchases,
      movements,
      outstandingInvoices,
    ] = await Promise.all([
      db.customerPayment.findMany({
        where: {
          businessId:
            context.businessId,
          paidAt: {
            gte: period.start,
            lt: period.endExclusive,
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
          businessId:
            context.businessId,
          status: "POSTED",
          expenseDate: {
            gte: period.start,
            lt: period.endExclusive,
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
          businessId:
            context.businessId,
          createdAt: {
            gte: period.start,
            lt: period.endExclusive,
          },
        },
        include: {
          customer: true,
          vehicle: true,
          customerPayments: true,
          service: {
            select: {
              partsUsed: {
                select: {
                  costTotal: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),

      db.part.findMany({
        where: {
          businessId:
            context.businessId,
        },
        orderBy: {
          name: "asc",
        },
      }),

      db.purchaseOrder.findMany({
        where: {
          businessId:
            context.businessId,
          status: "RECEIVED",
          updatedAt: {
            gte: period.start,
            lt: period.endExclusive,
          },
        },
        orderBy: {
          updatedAt: "asc",
        },
      }),

      db.inventoryMovement.findMany({
        where: {
          businessId:
            context.businessId,
          createdAt: {
            gte: period.start,
            lt: period.endExclusive,
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

      db.invoice.findMany({
        where: {
          businessId:
            context.businessId,
          status: {
            in: [
              "UNPAID",
              "OVERDUE",
            ],
          },
        },
        select: {
          total: true,
          customerPayments: {
            select: {
              amount: true,
            },
          },
        },
      }),
    ]);

    const issuedInvoices =
      invoices.filter(
        (invoice) =>
          invoice.status !== "DRAFT",
      );

    const income = payments.reduce(
      (sum, payment) =>
        addMoney(
          sum,
          payment.amount,
        ),
      toMoney(0),
    );

    const invoicedRevenue =
      sumInvoiceTotals(
        issuedInvoices,
      );

    const netRevenue =
      sumInvoiceNetRevenue(
        issuedInvoices,
      );

    const cogs =
      sumInvoiceCogs(
        issuedInvoices,
      );

    const expenseTotal =
      expenses.reduce(
        (sum, expense) =>
          addMoney(
            sum,
            expense.amount,
          ),
        toMoney(0),
      );

    const purchaseTotal =
      purchases.reduce(
        (sum, purchase) =>
          addMoney(
            sum,
            purchase.total,
          ),
        toMoney(0),
      );

    const {
      cashOutflows,
      cashResult,
      grossProfit,
      operatingProfit,
    } = calculateFinanceResults({
      cashIncome: income,
      operatingExpenses:
        expenseTotal,
      purchases: purchaseTotal,
      netRevenue,
      cogs,
    });

    const inventoryValue =
      parts.reduce(
        (sum, part) =>
          addMoney(
            sum,
            multiplyMoney(
              part.buyPrice,
              part.stock,
            ),
          ),
        toMoney(0),
      );

    const receivables =
      outstandingInvoices.reduce(
        (sum, invoice) => {
          const paid =
            invoice.customerPayments.reduce(
              (
                paymentSum,
                payment,
              ) =>
                addMoney(
                  paymentSum,
                  payment.amount,
                ),
              toMoney(0),
            );

          const remaining =
            nonNegativeMoney(
              subtractMoney(
                invoice.total,
                paid,
              ),
            );

          return addMoney(
            sum,
            remaining,
          );
        },
        toMoney(0),
      );

    const sheets = [
      {
        name: "Përmbledhje",

        rows: [
          [
            "AutoFlow - Raport financiar",
            context.business.name,
          ],

          [
            "Periudha",
            `${formatDate(
              period.start,
            )} - ${formatDate(
              period.end,
            )}`,
          ],

          [
            "Të faturuara",
            moneyToNumber(
              invoicedRevenue,
            ),
          ],

          [
            "Të ardhura neto",
            moneyToNumber(
              netRevenue,
            ),
          ],

          [
            "Të arkëtuara",
            moneyToNumber(income),
          ],

          [
            "Kosto e pjesëve (COGS)",
            moneyToNumber(cogs),
          ],

          [
            "Fitimi bruto",
            moneyToNumber(
              grossProfit,
            ),
          ],

          [
            "Shpenzime operative",
            moneyToNumber(
              expenseTotal,
            ),
          ],

          [
            "Fitimi operativ",
            moneyToNumber(
              operatingProfit,
            ),
          ],

          [
            "Blerje të pranuara",
            moneyToNumber(
              purchaseTotal,
            ),
          ],

          [
            "Dalje të arkës",
            moneyToNumber(
              cashOutflows,
            ),
          ],

          [
            "Rezultati i arkës",
            moneyToNumber(
              cashResult,
            ),
          ],

          [
            "Vlera aktuale e inventarit",
            moneyToNumber(
              inventoryValue,
            ),
          ],

          [
            "Detyrime klientësh",
            moneyToNumber(
              receivables,
            ),
          ],

          [
            "Eksportuar nga",
            context.user.name ||
              context.user.email,
          ],

          [
            "Data e eksportit",
            new Date().toLocaleString(
              "sq-AL",
            ),
          ],
        ],
      },

      {
        name: "Të ardhura",

        rows: [
          [
            "Data",
            "Fatura",
            "Mënyra",
            "Referenca",
            "Regjistruar nga",
            "Shuma",
          ],

          ...payments.map(
            (payment) => [
              formatDate(
                payment.paidAt,
              ),
              payment.invoice.number,
              payment.method,
              payment.reference || "",
              payment.recordedBy
                ?.name || "",
              moneyToNumber(
                payment.amount,
              ),
            ],
          ),

          [
            "TOTAL",
            "",
            "",
            "",
            "",
            moneyToNumber(income),
          ],
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

          ...expenses.map(
            (expense) => [
              formatDate(
                expense.expenseDate,
              ),
              expense.category
                ?.name || "",
              expense.description,
              expense.supplier || "",
              expense.documentNumber ||
                "",
              expense.paymentMethod,
              moneyToNumber(
                expense.amount,
              ),
            ],
          ),

          [
            "TOTAL",
            "",
            "",
            "",
            "",
            "",
            moneyToNumber(
              expenseTotal,
            ),
          ],
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
            "TVSH",
            "Të ardhura neto",
            "COGS",
            "Marzhi bruto",
            "Paguar",
            "Mbetur",
          ],

          ...invoices.map(
            (invoice) => {
              const paid =
                invoice.customerPayments.reduce(
                  (
                    sum,
                    payment,
                  ) =>
                    addMoney(
                      sum,
                      payment.amount,
                    ),
                  toMoney(0),
                );

              const remaining =
                nonNegativeMoney(
                  subtractMoney(
                    invoice.total,
                    paid,
                  ),
                );

              const invoiceNetRevenue =
                getInvoiceNetRevenue(
                  invoice,
                );

              const invoiceCogs =
                getInvoiceCogs(
                  invoice,
                );

              const invoiceGrossProfit =
                subtractMoney(
                  invoiceNetRevenue,
                  invoiceCogs,
                );

              return [
                formatDate(
                  invoice.createdAt,
                ),
                invoice.number,
                invoice.customer
                  ?.name || "",
                invoice.vehicle
                  ? `${invoice.vehicle.brand} ${invoice.vehicle.plate}`
                  : "",
                invoice.status,
                moneyToNumber(
                  invoice.total,
                ),
                moneyToNumber(
                  invoice.vatAmount,
                ),
                moneyToNumber(
                  invoiceNetRevenue,
                ),
                moneyToNumber(
                  invoiceCogs,
                ),
                moneyToNumber(
                  invoiceGrossProfit,
                ),
                moneyToNumber(paid),
                moneyToNumber(
                  remaining,
                ),
              ];
            },
          ),
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

          ...parts.map((part) => {
            const partValue =
              multiplyMoney(
                part.buyPrice,
                part.stock,
              );

            return [
              part.code || "",
              part.name,
              part.category || "",
              part.supplier || "",
              part.stock,
              moneyToNumber(
                part.buyPrice,
              ),
              moneyToNumber(
                partValue,
              ),
              part.minStock,
            ];
          }),

          [
            "TOTAL",
            "",
            "",
            "",
            "",
            "",
            moneyToNumber(
              inventoryValue,
            ),
            "",
          ],
        ],
      },

      {
        name: "Porosi",

        rows: [
          [
            "Data e pranimit",
            "Furnitori",
            "Statusi",
            "Totali",
            "Shënime",
          ],

          ...purchases.map(
            (purchase) => [
              formatDate(
                purchase.updatedAt,
              ),
              purchase.supplier,
              purchase.status,
              moneyToNumber(
                purchase.total,
              ),
              purchase.notes || "",
            ],
          ),

          [
            "TOTAL",
            "",
            "",
            moneyToNumber(
              purchaseTotal,
            ),
            "",
          ],
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

          ...movements.map(
            (movement) => [
              formatDate(
                movement.createdAt,
              ),
              movement.part.name,
              movement.type,
              movement.quantity,
              movement.stockBefore,
              movement.stockAfter,
              movement.user?.name ||
                "",
              movement.note || "",
            ],
          ),
        ],
      },
    ];

    const bytes = buildXlsx(
      sheets,
    );

    const fileName =
      `autoflow-raport-` +
      `${period.startInput}-` +
      `${period.endInput}.xlsx`;

    await db.financialReportExport.create({
      data: {
        businessId:
          context.businessId,
        userId: context.userId,
        reportType: "FULL",
        periodStart: period.start,
        periodEnd: period.end,
        fileName,
      },
    });

    await createAuditLog({
      businessId:
        context.businessId,
      userId: context.userId,
      action: "EXPORT",
      entityType:
        "FinancialReport",
      title:
        "U eksportua raporti financiar",
      description: fileName,
      metadata: {
        periodStart: period.start,
        periodEnd: period.end,
      },
    });

    return new NextResponse(
      bytes,
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition":
            `attachment; filename="${fileName}"`,
          "Cache-Control":
            "no-store",
          "x-request-id":
            requestId,
        },
      },
    );
  } catch (error) {
    return apiError(error, {
      request,
      requestId,
      fallbackMessage:
        "Raporti financiar nuk mund të eksportohej.",
    });
  }
}
