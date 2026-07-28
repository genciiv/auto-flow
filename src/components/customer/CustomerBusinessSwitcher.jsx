"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, LoaderCircle } from "lucide-react";

export default function CustomerBusinessSwitcher({
  memberships = [],
  onNavigate,
}) {
  const router = useRouter();
  const { update } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!memberships.length) {
    return null;
  }

  function switchToBusiness(businessId) {
    if (!businessId || isPending) {
      return;
    }

    setIsOpen(false);

    startTransition(async () => {
      await update({
        activeBusinessId: businessId,
      });

      onNavigate?.();

      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={isPending}
        className="flex w-full items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-left text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
          {isPending ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Building2 size={17} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">Kalo te biznesi</p>

          <p className="mt-0.5 text-xs text-blue-600">
            {memberships.length === 1
              ? memberships[0].businessName
              : `${memberships.length} biznese`}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`transition ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen ? (
        <div className="mt-2 space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {memberships.map((membership) => (
            <button
              key={membership.id || membership.businessId}
              type="button"
              onClick={() => switchToBusiness(membership.businessId)}
              disabled={isPending}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Building2 size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {membership.businessName || "Biznes pa emër"}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {membership.role || "Anëtar"}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
