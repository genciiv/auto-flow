"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LoaderCircle,
  LogOut,
  Settings,
  User,
} from "lucide-react";

const menuItems = [
  {
    title: "Profili",
    icon: User,
    href: "/dashboard/settings#profile",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "Cilësimet",
    icon: Settings,
    href: "/dashboard/settings",
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
  {
    title: "Abonimi",
    icon: CreditCard,
    href: "/dashboard/settings/subscription",
    permission: PERMISSIONS.BILLING_VIEW,
  },
  {
    title: "Ndihmë",
    icon: HelpCircle,
    href: "/#contact",
  },
];

function getInitials(name) {
  if (!name || typeof name !== "string") {
    return "AF";
  }

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "AF";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function getRoleLabel(role) {
  const roleLabels = {
    OWNER: "Pronar",
    MANAGER: "Menaxher",
    MECHANIC: "Mekanik",
    RECEPTIONIST: "Recepsionist",
    WAREHOUSE: "Magazinier",
    ACCOUNTANT: "Financier",
  };

  return roleLabels[role] || "Përdorues";
}

export default function ProfileMenu({
  businessName,
  userName,
  userEmail,
  businessRole,
}) {
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayedBusinessName = businessName?.trim() || "Biznesi im";

  const displayedUserName = userName?.trim() || "Përdorues";

  const displayedUserEmail = userEmail?.trim() || "";

  const initials = getInitials(displayedUserName);
  const roleLabel = getRoleLabel(businessRole);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      setOpen(false);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Gabim gjatë daljes nga llogaria:", error);

      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((currentValue) => !currentValue)}
        aria-expanded={open}
        aria-label="Hap menunë e profilit"
        className="flex min-h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
          {initials}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-40 truncate text-sm font-bold text-slate-950">
            {displayedUserName}
          </p>

          <p className="text-xs text-slate-500">{roleLabel}</p>
        </div>

        <ChevronDown
          size={16}
          className={`hidden shrink-0 text-slate-400 transition-transform sm:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Mbyll menunë"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div className="af-popover absolute right-0 z-50 mt-2 w-72 p-2.5">
            <div className="border-b border-slate-100 px-3 py-3">
              <p className="truncate font-bold text-slate-950">
                {displayedBusinessName}
              </p>

              {displayedUserEmail ? (
                <p className="mt-1 truncate text-sm text-slate-500">
                  {displayedUserEmail}
                </p>
              ) : null}
            </div>

            <div className="mt-2 space-y-1">
              {menuItems
                .filter(
                  (item) =>
                    !item.permission ||
                    hasPermission(businessRole, item.permission),
                )
                .map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <Icon size={18} />

                    {item.title}
                  </Link>
                );
              })}

              <div className="my-2 border-t border-slate-100" />

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}

                {isLoggingOut ? "Duke dalë..." : "Dil nga llogaria"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
