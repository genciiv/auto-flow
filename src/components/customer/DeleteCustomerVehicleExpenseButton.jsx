"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

import { deleteCustomerVehicleExpense } from "@/app/customer/vehicles/history-actions";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

export default function DeleteCustomerVehicleExpenseButton({
  vehicleId,
  expenseId,
}) {
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Fshi shpenzimin",
      description:
        "Ky shpenzim do të hiqet nga historiku personal i automjetit.",
      confirmLabel: "Fshi shpenzimin",
      tone: "danger",
    });

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCustomerVehicleExpense(vehicleId, expenseId);

      if (!result.success) {
        toast.error(result.message || "Shpenzimi nuk mund të fshihej.");
        return;
      }

      toast.success(result.message || "Shpenzimi u fshi.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Fshi shpenzimin"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        <LoaderCircle size={15} className="animate-spin" />
      ) : (
        <Trash2 size={15} />
      )}
    </button>
  );
}
