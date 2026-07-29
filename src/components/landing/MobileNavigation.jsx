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

const navigation = [
  {
    label: "Platforma",
    href: "/#platform",
  },
  {
    label: "Si funksionon",
    href: "/#how-it-works",
  },
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  {
    label: "Çmimet",
    href: "/#pricing",
  },
  {
    label: "Pyetje të shpeshta",
    href: "/#faq",
  },
];

export default function MobileNavigation({ destination = null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function closeNavigation() {
    setOpen(false);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Hap menunë"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Mbyll menunë"
              onClick={closeNavigation}
              className="fixed inset-0 z-[80] bg-slate-950/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menuja kryesore"
              className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-sm flex-col border-l border-slate-200 bg-white p-6 shadow-2xl"
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
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  onClick={closeNavigation}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <CarFront size={20} />
                  </div>

                  <div>
                    <p className="text-lg font-black tracking-tight text-slate-950">
                      AutoFlow
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Automotive platform
                    </p>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={closeNavigation}
                  aria-label="Mbyll menunë"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  <X size={19} />
                </button>
              </div>

              <nav className="mt-10 flex flex-col">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{
                      opacity: 0,
                      x: 20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.08 + index * 0.05,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={closeNavigation}
                      className="flex items-center justify-between border-b border-slate-100 py-5 text-base font-bold text-slate-800 transition hover:text-blue-600"
                    >
                      {item.label}
                      <ArrowRight size={17} />
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-3 pt-8">
                {destination ? (
                  <Link
                    href={destination.href}
                    onClick={closeNavigation}
                    className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    <LayoutDashboard size={18} />
                    {destination.label}
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={closeNavigation}
                      className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                    >
                      <LogIn size={18} />
                      Hyr në llogari
                    </Link>

                    <Link
                      href="/apply"
                      onClick={closeNavigation}
                      className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                    >
                      Apliko për AutoFlow
                      <ArrowRight size={18} />
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
