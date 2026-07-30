"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { plans } from "@/constants/plans";

export default function PricingSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-white py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-100/35 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 22,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            <Sparkles size={14} />
            Planet AutoFlow
          </div>

          <h2 className="mt-5 text-4xl font-black leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-5xl">
            Një plan që rritet bashkë me biznesin.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Fillo me funksionet kryesore dhe përmirëso planin kur ekipi dhe
            volumi i punës rriten.
          </p>
        </motion.div>

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const customPlan =
              plan.price === "Custom" || plan.price === "Me ofertë";

            return (
              <motion.article
                key={plan.name}
                className={`relative flex min-h-[460px] overflow-hidden rounded-[1.75rem] border p-6 ${
                  plan.highlighted
                    ? "border-blue-600 bg-blue-600 text-white shadow-[0_26px_70px_rgba(37,99,235,0.24)]"
                    : "border-slate-200 bg-white text-slate-950 shadow-[0_18px_55px_rgba(15,23,42,0.06)]"
                }`}
                initial={{
                  opacity: 0,
                  y: 28,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                        y: -6,
                      }
                }
              >
                {plan.highlighted ? (
                  <>
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-[65px]" />

                    <span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-blue-600">
                      Më i zgjedhuri
                    </span>
                  </>
                ) : null}

                <div className="relative flex w-full flex-col">
                  <h3 className="text-xl font-black">{plan.name}</h3>

                  <p
                    className={`mt-2 min-h-10 text-xs leading-5 ${
                      plan.highlighted ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-6 flex items-end gap-2">
                    <span className="text-4xl font-black tracking-tight">
                      {plan.price}
                    </span>

                    {!customPlan ? (
                      <span
                        className={`pb-1 text-sm ${
                          plan.highlighted ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        /muaj
                      </span>
                    ) : null}
                  </div>

                  <div
                    className={`my-6 h-px ${
                      plan.highlighted ? "bg-white/20" : "bg-slate-200"
                    }`}
                  />

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            plan.highlighted
                              ? "bg-white/15 text-white"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>

                        <span
                          className={`text-xs leading-5 ${
                            plan.highlighted ? "text-blue-50" : "text-slate-600"
                          }`}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/apply"
                    className={`group mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-black transition ${
                      plan.highlighted
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-slate-950 text-white hover:bg-slate-800"
                    }`}
                  >
                    {customPlan ? "Kërko ofertë" : "Fillo falas"}

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>

        <p className="mt-7 text-center text-xs font-medium text-slate-500">
          Mund ta ndryshosh planin kur të rriten nevojat e biznesit.
        </p>
      </div>
    </section>
  );
}
