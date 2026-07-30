"use client";

import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  landingNavigationItems,
  scrollToLandingSection,
} from "@/components/landing/LandingNavigationLinks";

export default function MobileNavigation({ destination = null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function closeNavigation() {
    setOpen(false);
  }

  function handleSectionNavigation(targetId) {
    setOpen(false);

    window.setTimeout(() => {
      scrollToLandingSection(targetId);
    }, 180);
  }

  const mobileMenu = open
    ? createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[9999] bg-white lg:hidden"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <motion.div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Menuja kryesore"
              className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white"
              initial={{
                x: "100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "100%",
              }}
              transition={{
                duration: 0.34,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
                <Link
                  href="/"
                  onClick={closeNavigation}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <CarFront size={20} />
                  </div>

                  <div>
                    <p className="text-lg font-black tracking-[-0.03em] text-slate-950">
                      AutoFlow
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Automotive platform
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={closeNavigation}
                  aria-label="Mbyll menunë"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <X size={20} />
                </button>
              </header>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-6">
                <nav className="mt-5 flex flex-col">
                  {landingNavigationItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{
                        opacity: 0,
                        x: 20,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        duration: 0.35,
                        delay: 0.08 + index * 0.05,
                      }}
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={closeNavigation}
                          className="flex w-full items-center justify-between border-b border-slate-100 py-5 text-left text-lg font-black text-slate-900 transition hover:text-blue-600"
                        >
                          <span>{item.label}</span>

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <ArrowRight size={17} />
                          </span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSectionNavigation(item.targetId)}
                          className="flex w-full items-center justify-between border-b border-slate-100 py-5 text-left text-lg font-black text-slate-900 transition hover:text-blue-600"
                        >
                          <span>{item.label}</span>

                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <ArrowRight size={17} />
                          </span>
                        </button>
                      )}
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-auto space-y-3 pt-8">
                  {destination ? (
                    <Link
                      href={destination.href}
                      onClick={closeNavigation}
                      className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800"
                    >
                      <LayoutDashboard size={18} />
                      {destination.label}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeNavigation}
                        className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-800 shadow-sm transition hover:bg-slate-50"
                      >
                        <LogIn size={18} />
                        Hyr në llogari
                      </Link>

                      <Link
                        href="/apply"
                        onClick={closeNavigation}
                        className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                      >
                        Apliko për AutoFlow
                        <ArrowRight size={18} />
                      </Link>
                    </>
                  )}
                </div>

                <p className="mt-5 text-center text-[11px] font-medium text-slate-400">
                  Platformë profesionale për bizneset automotive.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )
    : null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Hap menunë"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Menu size={20} />
      </button>

      {mobileMenu}
    </div>
  );
}
