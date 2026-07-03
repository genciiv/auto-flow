"use client";

import { receivePurchaseOrder } from "@/actions/purchase-item-actions";

export default function ReceivePurchaseButton({ purchaseOrderId, disabled }) {
  async function handleReceive() {
    await receivePurchaseOrder(purchaseOrderId);
  }

  return (
    <button
      onClick={handleReceive}
      disabled={disabled}
      className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      Merr në magazinë
    </button>
  );
}
