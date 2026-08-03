"use client";

import {
  CarFront,
  CircleGauge,
  PackageSearch,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const industries = [
  {
    label: "Auto Servise",
    icon: Wrench,
  },
  {
    label: "Gomisteri",
    icon: CircleGauge,
  },
  {
    label: "Autoelektrikë",
    icon: Sparkles,
  },
  {
    label: "Dyqane Pjesësh",
    icon: PackageSearch,
  },
  {
    label: "Shitës Automjetesh",
    icon: CarFront,
  },
  {
    label: "Flota Biznesi",
    icon: Truck,
  },
  {
    label: "Kontroll Teknik",
    icon: ShieldCheck,
  },
  {
    label: "Menaxhim biznesi",
    icon: Store,
  },
];

function IndustryItem({ label, icon: Icon }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-full border border-slate-200/80 bg-white px-5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Icon size={16} strokeWidth={2} />
      </span>

      <span className="whitespace-nowrap text-sm font-semibold text-slate-700">
        {label}
      </span>
    </div>
  );
}

export default function IndustryMarquee() {
  const shouldReduceMotion = useReducedMotion();

  const repeatedIndustries = [...industries, ...industries];

  return (
    <section className="overflow-hidden border-y border-slate-200/80 bg-white py-8">
      <div className="mx-auto mb-6 max-w-7xl px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Një platformë për ekosistemin automotive
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent md:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent md:w-48" />

        <motion.div
          className="flex w-max gap-4 px-4"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  x: ["0%", "-50%"],
                }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : {
                  duration: 28,
                  repeat: Infinity,
                  ease: "linear",
                }
          }
        >
          {repeatedIndustries.map((industry, index) => (
            <IndustryItem key={`${industry.label}-${index}`} {...industry} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
