import { notFound } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { requireBusinessContext } from "@/lib/business-context";
import { db } from "@/lib/db";
import {
  addMoney,
  moneyToNumber,
  toMoney,
} from "@/lib/money";
import {
  hasPermission,
  PERMISSIONS,
} from "@/lib/permissions";

import {
  approveInventoryCountAction,
  postInventoryCountAction,
  saveInventoryCountAction,
  submitInventoryCountAction,
} from "../../actions";

function formatAmount(value) {
  return moneyToNumber(value).toLocaleString("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default async function CountDetail({ params }) {
  const { id } = await params;

  const {
    businessId,
    businessRole,
  } = await requireBusinessContext();

  const count = await db.inventoryCount.findFirst({
    where: {
      id,
      businessId,
    },
    include: {
      items: {
        orderBy: {
          partName: "asc",
        },
      },
    },
  });

  if (!count) {
    notFound();
  }

  const editable =
    count.status === "DRAFT" &&
    hasPermission(
      businessRole,
      PERMISSIONS.INVENTORY_COUNTS_MANAGE,
    );

  const canApprove = hasPermission(
    businessRole,
    PERMISSIONS.INVENTORY_COUNTS_APPROVE,
  );

  const totals = count.items.reduce(
    (accumulator, item) => ({
      expected: addMoney(
        accumulator.expected,
        item.expectedValue,
      ),
      actual: addMoney(
        accumulator.actual,
        item.actualValue ?? 0,
      ),
      difference: addMoney(
        accumulator.difference,
        item.differenceValue ?? 0,
      ),
    }),
    {
      expected: toMoney(0),
      actual: toMoney(0),
      difference: toMoney(0),
    },
  );

  const summaryCards = [
    {
      label: "Vlera sipas sistemit",
      value: totals.expected,
    },
    {
      label: "Vlera reale",
      value: totals.actual,
    },
    {
      label: "Diferenca",
      value: totals.difference,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold text-blue-600">
            {count.status}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {count.name}
          </h1>

          <p className="mt-2 text-slate-500">
            Data:{" "}
            {new Date(count.countDate).toLocaleDateString(
              "sq-AL",
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border bg-white p-5"
            >
              <p className="text-sm text-slate-500">
                {card.label}
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatAmount(card.value)} ALL
              </p>
            </div>
          ))}
        </div>

        <form
          action={saveInventoryCountAction}
          className="overflow-x-auto rounded-2xl border bg-white"
        >
          <input
            type="hidden"
            name="inventoryCountId"
            value={count.id}
          />

          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="p-3">Pjesa</th>
                <th>Pritet</th>
                <th>Reale</th>
                <th>Diferenca</th>
                <th>Vlera e diferencës</th>
                <th>Shënim</th>
              </tr>
            </thead>

            <tbody>
              {count.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="p-3 font-semibold">
                    {item.partName}

                    <div className="text-xs text-slate-400">
                      {item.partCode || ""}
                    </div>
                  </td>

                  <td>{item.expectedQuantity}</td>

                  <td>
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        name={`actual_${item.id}`}
                        defaultValue={
                          item.actualQuantity ??
                          item.expectedQuantity
                        }
                        className="w-24 rounded-lg border px-2 py-1"
                      />
                    ) : (
                      item.actualQuantity ?? "—"
                    )}
                  </td>

                  <td>
                    {item.difference ?? "—"}
                  </td>

                  <td>
                    {formatAmount(
                      item.differenceValue ?? 0,
                    )}{" "}
                    ALL
                  </td>

                  <td>
                    {editable ? (
                      <input
                        name={`note_${item.id}`}
                        defaultValue={item.note || ""}
                        className="rounded-lg border px-2 py-1"
                      />
                    ) : (
                      item.note || "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editable ? (
            <div className="flex gap-3 border-t p-4">
              <button className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">
                Ruaj sasitë
              </button>
            </div>
          ) : null}
        </form>

        <div className="flex flex-wrap gap-3">
          {editable ? (
            <form action={submitInventoryCountAction}>
              <input
                type="hidden"
                name="inventoryCountId"
                value={count.id}
              />

              <button className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white">
                Dërgo për shqyrtim
              </button>
            </form>
          ) : null}

          {count.status === "IN_REVIEW" && canApprove ? (
            <form action={approveInventoryCountAction}>
              <input
                type="hidden"
                name="inventoryCountId"
                value={count.id}
              />

              <button className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white">
                Aprovo
              </button>
            </form>
          ) : null}

          {count.status === "APPROVED" && canApprove ? (
            <form action={postInventoryCountAction}>
              <input
                type="hidden"
                name="inventoryCountId"
                value={count.id}
              />

              <button className="rounded-xl bg-amber-600 px-4 py-2 font-bold text-white">
                Posto korrigjimet në stok
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}

