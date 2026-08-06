import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  FileSpreadsheet,
  PackageCheck,
  ReceiptText,
  TrendingUp,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PeriodFilter from "@/components/finance/PeriodFilter";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { parseFinancePeriod } from "@/lib/finance-period";
import {
  addMoney,
  formatMoney,
  isMoneyLessThan,
  multiplyMoney,
  subtractMoney,
  toMoney,
} from "@/lib/money";
import { PERMISSIONS } from "@/lib/permissions";

export default async function FinancePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const period = parseFinancePeriod(resolvedSearchParams);

  const {
    businessId,
    business,
  } = await requireBusinessPermission(
    PERMISSIONS.FINANCE_VIEW,
  );

  const [
    payments,
    issuedInvoices,
    expenses,
    purchases,
    parts,
    unpaidInvoices,
    activeInventoryCounts,
  ] = await Promise.all([
    db.customerPayment.aggregate({
      where: {
        businessId,
        paidAt: {
          gte: period.start,
          lt: period.endExclusive,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    }),

    db.invoice.aggregate({
      where: {
        businessId,
        status: {
          not: "DRAFT",
        },
        createdAt: {
          gte: period.start,
          lt: period.endExclusive,
        },
      },
      _sum: {
        total: true,
      },
      _count: true,
    }),

    db.businessExpense.aggregate({
      where: {
        businessId,
        status: "POSTED",
        expenseDate: {
          gte: period.start,
          lt: period.endExclusive,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    }),

    db.purchaseOrder.aggregate({
      where: {
        businessId,
        status: "RECEIVED",
        createdAt: {
          gte: period.start,
          lt: period.endExclusive,
        },
      },
      _sum: {
        total: true,
      },
    }),

    db.part.findMany({
      where: {
        businessId,
      },
      select: {
        stock: true,
        buyPrice: true,
      },
    }),

    db.invoice.findMany({
      where: {
        businessId,
        status: {
          in: ["UNPAID", "OVERDUE"],
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

    db.inventoryCount.count({
      where: {
        businessId,
        status: {
          in: ["DRAFT", "IN_REVIEW", "APPROVED"],
        },
      },
    }),
  ]);

  const income = toMoney(payments._sum.amount ?? 0);
  const invoicedRevenue = toMoney(
    issuedInvoices._sum.total ?? 0,
  );
  const operatingExpenses = toMoney(
    expenses._sum.amount ?? 0,
  );
  const purchaseExpenses = toMoney(
    purchases._sum.total ?? 0,
  );

  const totalExpenses = addMoney(
    operatingExpenses,
    purchaseExpenses,
  );

  const profit = subtractMoney(
    income,
    totalExpenses,
  );

  const inventoryValue = parts.reduce(
    (total, part) =>
      addMoney(
        total,
        multiplyMoney(
          part.buyPrice,
          part.stock,
        ),
      ),
    toMoney(0),
  );

  const receivables = unpaidInvoices.reduce(
    (totalReceivables, invoice) => {
      const paidAmount = invoice.customerPayments.reduce(
        (totalPaid, payment) =>
          addMoney(totalPaid, payment.amount),
        toMoney(0),
      );

      const remaining = subtractMoney(
        invoice.total,
        paidAmount,
      );

      const normalizedRemaining = isMoneyLessThan(
        remaining,
        0,
      )
        ? toMoney(0)
        : remaining;

      return addMoney(
        totalReceivables,
        normalizedRemaining,
      );
    },
    toMoney(0),
  );

  const cards = [
    {
      label: "Të faturuara",
      value: invoicedRevenue,
      icon: FileSpreadsheet,
    },
    {
      label: "Të arkëtuara",
      value: income,
      icon: TrendingUp,
    },
    {
      label: "Shpenzime",
      value: totalExpenses,
      icon: ReceiptText,
    },
    {
      label: "Rezultati",
      value: profit,
      icon: Banknote,
    },
    {
      label: "Vlera e stokut",
      value: inventoryValue,
      icon: PackageCheck,
    },
    {
      label: "Detyrime klientësh",
      value: receivables,
      icon: ReceiptText,
    },
  ];

  const financeLinks = [
    {
      title: "Shpenzimet",
      description:
        "Regjistro dhe kategorizo shpenzimet.",
      href: "/dashboard/finance/expenses",
    },
    {
      title: "Inventarizimet",
      description: `${activeInventoryCounts} procese aktive të inventarit.`,
      href: "/dashboard/finance/inventory-counts",
    },
    {
      title: "Raportet & Excel",
      description:
        "Gjenero raporte dhe ruaji në kompjuter.",
      href: "/dashboard/finance/reports",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="text-sm font-bold text-blue-600">
            Financa & raportim
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Paneli financiar
          </h1>

          <p className="mt-2 text-slate-500">
            Raporte mujore, tremujore, vjetore,
            inventarizime dhe eksporte Excel.
          </p>
        </div>

        <PeriodFilter period={period} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {formatMoney(card.value, {
                    currency: business.currency,
                    locale: "sq-AL",
                  })}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {financeLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-[1.25rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <FileSpreadsheet className="text-blue-600" />

              <h2 className="mt-4 font-bold">
                {item.title}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {item.description}
              </p>

              <span className="mt-4 flex items-center gap-2 text-sm font-bold text-blue-600">
                Hape
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}