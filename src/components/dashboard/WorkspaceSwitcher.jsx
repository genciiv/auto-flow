"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronDown,
  LoaderCircle,
  UserRound,
} from "lucide-react";

export default function WorkspaceSwitcher({
  businessName,
  businessId,
  memberships = [],
  canAccessCustomerPortal = false,
}) {
  const router = useRouter();
  const { update } = useSession();

  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const displayedBusinessName = businessName?.trim() || "Biznesi im";

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function switchToBusiness(selectedBusinessId) {
    if (!selectedBusinessId || selectedBusinessId === businessId || isPending) {
      setIsOpen(false);
      return;
    }

    setIsOpen(false);

    startTransition(async () => {
      await update({
        activeBusinessId: selectedBusinessId,
      });

      router.push("/dashboard");
      router.refresh();
    });
  }

  function switchToCustomerPortal() {
    if (isPending) {
      return;
    }

    setIsOpen(false);

    startTransition(() => {
      router.push("/customer/dashboard");
      router.refresh();
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Ndrysho hapësirën e punës"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        disabled={isPending}
        className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-left shadow-sm transition hover:border-slate-300 hover:bg-white disabled:cursor-wait disabled:opacity-70"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
          {isPending ? (
            <LoaderCircle size={19} className="animate-spin" />
          ) : (
            <Building2 size={20} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-slate-950">
            {displayedBusinessName}
          </p>

          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Hapësira aktive
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden af-popover p-2">
          <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Hapësirat e punës
          </p>

          <div className="space-y-1">
            {memberships.map((membership) => {
              const isActive = membership.businessId === businessId;

              return (
                <button
                  key={membership.id || membership.businessId}
                  type="button"
                  onClick={() => switchToBusiness(membership.businessId)}
                  disabled={isPending}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Building2 size={17} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {membership.businessName || "Biznes pa emër"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {membership.role || "Anëtar"}
                    </p>
                  </div>

                  {isActive ? <Check size={17} className="shrink-0" /> : null}
                </button>
              );
            })}
          </div>

          {canAccessCustomerPortal ? (
            <>
              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                onClick={switchToCustomerPortal}
                disabled={isPending}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <UserRound size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    Portali i klientit
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Makinat dhe kërkesat personale
                  </p>
                </div>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
