"use client";

import Link from "next/link";
import { ArrowRight, Check, Play, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import HeroProductVisual from "@/components/landing/HeroProductVisual";

const benefits = [
  "Pa kartë bankare",
  "Konfigurim i asistuar",
  "Të dhëna të sigurta",
];

export default function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(37,99,235,0.10),transparent_31%),radial-gradient(circle_at_83%_20%,rgba(14,165,233,0.09),transparent_28%),linear-gradient(to_bottom,#ffffff,#f8fafc_76%,#ffffff)]" />

        <div className="absolute inset-0 opacity-[0.38] [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[-140px] -z-10 h-[440px] w-[720px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-[120px]" />

      <div className="mx-auto grid min-h-[720px] max-w-[1380px] items-center gap-14 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24 xl:gap-16">
        <motion.div
          className="relative z-10"
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 24,
                }
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <h1 className="mt-7 max-w-3xl text-[2.65rem] font-black leading-[1.04] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.8rem] xl:text-[4.15rem]">
            Çdo pjesë e biznesit tënd,{" "}
            <span className="relative inline-block text-blue-600">
              në një rrjedhë.
              <svg
                aria-hidden="true"
                viewBox="0 0 360 18"
                className="absolute -bottom-2 left-0 w-full overflow-visible"
              >
                <motion.path
                  d="M4 12C82 3 168 17 356 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="text-blue-200"
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          pathLength: 0,
                          opacity: 0,
                        }
                  }
                  animate={{
                    pathLength: 1,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 1.1,
                    delay: 0.75,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-base leading-8 text-slate-600 sm:text-lg sm:leading-9">
            AutoFlow lidh klientët, automjetet, serviset, rezervimet, magazinën,
            faturat, pagesat dhe marketplace-in në një platformë të vetme
            profesionale.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/apply"
              className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(37,99,235,0.26)] transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-[0_22px_55px_rgba(37,99,235,0.34)]"
            >
              Fillo falas
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/#industries"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/90 px-7 text-sm font-black text-slate-800 shadow-[0_12px_35px_rgba(15,23,42,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-white">
                <Play size={13} fill="currentColor" />
              </span>
              Eksploro AutoFlow
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 sm:text-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check size={12} strokeWidth={3} />
                </span>

                {benefit}
              </div>
            ))}
          </div>
        </motion.div>

        <HeroProductVisual />
      </div>
    </section>
  );
}
