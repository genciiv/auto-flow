"use client";

import Link from "next/link";
import { Check, Cookie, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, useSyncExternalStore } from "react";

export const CONSENT_VERSION = 1;
export const STORAGE_KEY = "autoflow-cookie-consent";
export const COOKIE_NAME = "autoflow_cookie_consent";
export const COOKIE_EVENT = "autoflow-cookie-consent-change";

function subscribeToConsent(callback) {
  window.addEventListener(COOKIE_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(COOKIE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function readCookieConsent() {
  const prefix = `${COOKIE_NAME}=`;
  const item = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  if (!item) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(item.slice(prefix.length)));
  } catch {
    return null;
  }
}

function isCurrentConsent(value) {
  return Boolean(
    value &&
      value.necessary === true &&
      value.version === CONSENT_VERSION,
  );
}

function readStoredConsent() {
  try {
    const localValue = window.localStorage.getItem(STORAGE_KEY);

    if (localValue) {
      const parsedLocalValue = JSON.parse(localValue);

      if (isCurrentConsent(parsedLocalValue)) {
        return parsedLocalValue;
      }
    }
  } catch {
    // Nëse localStorage është i bllokuar, përdorim cookie-n si fallback.
  }

  const cookieValue = readCookieConsent();

  return isCurrentConsent(cookieValue) ? cookieValue : null;
}

function getConsentSnapshot() {
  const consent = readStoredConsent();

  return consent ? JSON.stringify(consent) : null;
}

function getServerConsentSnapshot() {
  return null;
}

function saveConsent(consent) {
  const value = {
    necessary: true,
    analytics: Boolean(consent.analytics),
    marketing: Boolean(consent.marketing),
    updatedAt: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  const serializedValue = JSON.stringify(value);

  try {
    window.localStorage.setItem(STORAGE_KEY, serializedValue);
  } catch {
    // Cookie vazhdon të ruajë zgjedhjen edhe kur localStorage nuk lejohet.
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    serializedValue,
  )}; Max-Age=31536000; Path=/; SameSite=Lax`;

  window.dispatchEvent(
    new CustomEvent(COOKIE_EVENT, {
      detail: value,
    }),
  );
}

export default function CookieConsent() {
  const storedConsent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    getServerConsentSnapshot,
  );

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  const visible = storedConsent === null;

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
    setSettingsOpen(false);
  }

  function rejectOptional() {
    saveConsent({ analytics: false, marketing: false });
    setSettingsOpen(false);
  }

  function savePreferences() {
    saveConsent(preferences);
    setSettingsOpen(false);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[10000] p-3 sm:p-5"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]">
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Cookie size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black tracking-tight text-slate-950">
                    Preferencat e cookies
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Përdorim cookies të domosdoshme për funksionimin dhe
                    sigurinë. Zgjedhja ruhet në këtë pajisje dhe nuk kërkohet
                    përsëri, përveçse kur pastron të dhënat e shfletuesit ose
                    ndryshon politika e cookies.
                  </p>

                  <Link
                    href="/cookies"
                    className="mt-2 inline-flex text-xs font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    Lexo politikën e cookies
                  </Link>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {settingsOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
                      <div className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div>
                          <p className="text-sm font-black text-slate-950">
                            Të domosdoshme
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Kërkohen për login, siguri dhe funksionim.
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                          Gjithmonë aktive
                        </span>
                      </div>

                      <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200">
                        <div>
                          <p className="text-sm font-black text-slate-950">
                            Analitike
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Ndihmojnë në matjen dhe përmirësimin e faqes.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(event) =>
                            setPreferences((current) => ({
                              ...current,
                              analytics: event.target.checked,
                            }))
                          }
                          className="h-5 w-5 shrink-0 accent-blue-600"
                        />
                      </label>

                      <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200">
                        <div>
                          <p className="text-sm font-black text-slate-950">
                            Marketing
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Përdoren vetëm për matje ose personalizim
                            marketingu.
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(event) =>
                            setPreferences((current) => ({
                              ...current,
                              marketing: event.target.checked,
                            }))
                          }
                          className="h-5 w-5 shrink-0 accent-blue-600"
                        />
                      </label>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  onClick={rejectOptional}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Refuzo jo të domosdoshmet
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsOpen((current) => !current)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Settings2 size={15} />
                  Personalizo
                </button>

                {settingsOpen ? (
                  <button
                    type="button"
                    onClick={savePreferences}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <Check size={15} />
                    Ruaj zgjedhjet
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                  >
                    <Check size={15} />
                    Prano të gjitha
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
