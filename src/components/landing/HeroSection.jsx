"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheckBig,
  ReceiptText,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const proofPoints = [
  "Pa instalim",
  "Punon në çdo pajisje",
  "Të dhënat e biznesit në një vend",
];

const floatingStats = [
  {
    icon: ReceiptText,
    label: "Të ardhura këtë muaj",
    value: "16,200 Lekë",
    className: "left-[-3%] top-[18%] hidden xl:flex",
  },
  {
    icon: Wrench,
    label: "Shërbime këtë muaj",
    value: "2 të përfunduara",
    className: "right-[-4%] top-[28%] hidden xl:flex",
  },
  {
    icon: CircleCheckBig,
    label: "Fatura të papaguara",
    value: "0",
    className: "bottom-[10%] right-[3%] hidden lg:flex",
  },
];

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="platform"
      className="relative isolate overflow-hidden bg-[#fbfcfe]"
    >
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_50%_-10%,rgba(37,99,235,0.10),transparent_34rem),linear-gradient(to_bottom,#ffffff_0%,#f8fbff_58%,#ffffff_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] opacity-50 [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <div className="mx-auto max-w-[1480px] px-5 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white px-4 py-2 text-xs font-extrabold text-blue-700 shadow-sm">
            <CalendarDays size={14} />
            Software për servise automotive
          </div>

          <h1 className="mt-7 text-[2.8rem] font-black leading-[0.98] tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-[5.1rem]">
            Servisi yt, pa kaos.
            <span className="block text-blue-600">Gjithçka në një sistem.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg sm:leading-9">
            Menaxho klientët, automjetet, terminet, urdhër-punët, pjesët,
            faturat dhe financat pa Excel, pa fletore dhe pa informacione të
            shpërndara në dhjetë vende.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
            >
              Fillo me AutoFlow
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/#how-it-works"
              className="inline-flex h-14 items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-sm font-black text-slate-800 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300"
            >
              Shiko si funksionon
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-3">
            {proofPoints.map((point) => (
              <span
                key={point}
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check size={12} strokeWidth={3} />
                </span>
                {point}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative mx-auto mt-14 max-w-[1320px]"
          initial={
            shouldReduceMotion ? false : { opacity: 0, y: 38, scale: 0.985 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-x-[12%] bottom-[-4%] -z-10 h-32 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white p-2 shadow-[0_35px_90px_rgba(15,23,42,0.15)] sm:p-3">
            <div className="flex h-9 items-center gap-2 border-b border-slate-100 px-3 sm:h-11 sm:px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
              <div className="mx-auto hidden rounded-lg bg-slate-50 px-20 py-1.5 text-[10px] font-semibold text-slate-400 sm:block">
                app.autoflow.al/dashboard
              </div>
            </div>

            <Image
              src="/images/autoflow-dashboard.png"
              alt="Paneli kryesor i AutoFlow për menaxhimin e servisit"
              width={1920}
              height={967}
              priority
              className="h-auto w-full rounded-[1.15rem]"
            />
          </div>

          {floatingStats.map(({ icon: Icon, label, value, className }) => (
            <motion.div
              key={label}
              className={`absolute z-20 w-[220px] items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-[0_18px_48px_rgba(15,23,42,0.13)] backdrop-blur ${className}`}
              animate={shouldReduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon size={18} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1 text-sm font-black text-slate-950">
                  {value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
