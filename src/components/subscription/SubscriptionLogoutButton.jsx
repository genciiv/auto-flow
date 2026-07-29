"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LoaderCircle, LogOut } from "lucide-react";

export default function SubscriptionLogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Gabim gjatë daljes nga llogaria:", error);
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? (
        <LoaderCircle size={17} className="animate-spin" />
      ) : (
        <LogOut size={17} />
      )}

      {isLoggingOut ? "Duke dalë..." : "Dil nga llogaria"}
    </button>
  );
}
