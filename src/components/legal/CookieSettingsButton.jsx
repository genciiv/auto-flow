"use client";

import { Cookie } from "lucide-react";

import {
  COOKIE_EVENT,
  COOKIE_NAME,
  STORAGE_KEY,
} from "@/components/legal/CookieConsent";

export default function CookieSettingsButton({ className = "" }) {
  function reopenSettings() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Cookie pastrohet edhe nëse localStorage është i bllokuar.
    }

    document.cookie = `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
    window.dispatchEvent(new CustomEvent(COOKIE_EVENT));
  }

  return (
    <button type="button" onClick={reopenSettings} className={className}>
      <Cookie size={14} />
      Cilësimet e cookies
    </button>
  );
}
