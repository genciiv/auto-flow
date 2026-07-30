"use client";

import { Cookie } from "lucide-react";

import { COOKIE_EVENT, STORAGE_KEY } from "@/components/legal/CookieConsent";

export default function CookieSettingsButton({ className = "" }) {
  function reopenSettings() {
    window.localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(new CustomEvent(COOKIE_EVENT));
  }

  return (
    <button type="button" onClick={reopenSettings} className={className}>
      <Cookie size={14} />
      Cilësimet e cookies
    </button>
  );
}
