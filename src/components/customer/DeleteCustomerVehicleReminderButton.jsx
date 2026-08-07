"use client";

import { useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

import { deleteCustomerVehicleReminder } from "@/app/customer/vehicles/maintenance-actions";
import { useConfirm } from "@/components/feedback/ConfirmProvider";
import { useToast } from "@/components/feedback/ToastProvider";

export default function DeleteCustomerVehicleReminderButton({ vehicleId, reminderId }) {
  const { confirm } = useConfirm();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const confirmed = await confirm({
      title: "Fshi kujtesën",
      description: "Kjo kujtesë do të hiqet nga automjeti.",
      confirmLabel: "Fshi kujtesën",
      tone: "danger",
    });

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCustomerVehicleReminder(vehicleId, reminderId);

      if (!result.success) {
        toast.error(result.message || "Kujtesa nuk mund të fshihej.");
        return;
      }

      toast.success(result.message || "Kujtesa u fshi.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Fshi kujtesën"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
    </button>
  );
}
