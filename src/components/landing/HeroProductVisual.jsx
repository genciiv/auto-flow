"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CarFront,
  Check,
  CircleDollarSign,
  Clock3,
  UserRound,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import FloatingElement from "@/components/landing/animations/FloatingElement";

const appointments = [
  {
    time: "09:30",
    vehicle: "BMW X5",
    service: "Ndërrim vaji",
    status: "Në proces",
  },
  {
    time: "11:00",
    vehicle: "Audi A4",
    service: "Diagnostikim",
    status: "Në pritje",
  },
  {
    time: "13:45",
    vehicle: "VW Golf 7",
    service: "Sistem frenimi",
    status: "Konfirmuar",
  },
];

function StatCard({ label, value, change, icon: Icon, delay }) {
  return (
    <motion.div
      className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-slate-500 sm:text-xs">
            {label}
          </p>

          <p className="mt-1.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            {value}
          </p>
        </div>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={15} />
        </div>
      </div>

      <p className="mt-2.5 flex items-center gap-1 text-[9px] font-bold text-emerald-600 sm:text-[10px]">
        <ArrowUpRight size={12} />
        {change}
      </p>
    </motion.div>
  );
}

export default function HeroProductVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
      <div className="absolute -left-10 top-20 h-48 w-48 rounded-full bg-blue-400/16 blur-[85px]" />

      <div className="absolute -right-8 bottom-12 h-56 w-56 rounded-full bg-cyan-300/18 blur-[95px]" />

      <FloatingElement
        className="absolute -left-10 top-32 z-20 hidden 2xl:block"
        distance={8}
        duration={5.5}
      >
        <div className="w-44 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Check size={16} />
            </div>

            <div>
              <p className="text-[10px] font-medium text-slate-500">
                Pagesa u konfirmua
              </p>

              <p className="mt-0.5 text-xs font-black text-slate-950">
                42,500 Lek
              </p>
            </div>
          </div>
        </div>
      </FloatingElement>

      <FloatingElement
        className="absolute -right-12 bottom-20 z-20 hidden 2xl:block"
        distance={10}
        duration={6}
        delay={0.6}
      >
        <div className="w-48 rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <CarFront size={16} />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-medium text-slate-500">
                Automjet i ri
              </p>

              <p className="mt-0.5 truncate text-xs font-black text-slate-950">
                Mercedes-Benz C220
              </p>
            </div>
          </div>
        </div>
      </FloatingElement>

      <motion.div
        className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-2 shadow-[0_32px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl"
        initial={
          shouldReduceMotion
            ? false
            : {
                opacity: 0,
                y: 28,
                scale: 0.97,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.85,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="overflow-hidden rounded-[1.55rem] border border-slate-200 bg-[#f7f9fc]">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <CarFront size={17} />
              </div>

              <div>
                <p className="text-xs font-black text-slate-950 sm:text-sm">
                  AutoFlow Service
                </p>

                <p className="text-[9px] font-medium text-slate-500 sm:text-[10px]">
                  Dashboard operacional
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
              Live
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                  Mirë se erdhe përsëri
                </p>

                <h3 className="mt-1 text-lg font-black tracking-tight text-slate-950 sm:text-xl">
                  Përmbledhja e sotme
                </h3>
              </div>

              <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600 sm:flex">
                <CalendarDays size={14} />
                29 Korrik 2026
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              <StatCard
                label="Klientë"
                value="1,248"
                change="+12 këtë muaj"
                icon={UserRound}
                delay={0.42}
              />

              <StatCard
                label="Automjete"
                value="2,410"
                change="+24 këtë muaj"
                icon={CarFront}
                delay={0.5}
              />

              <StatCard
                label="Shërbime"
                value="486"
                change="+8.4%"
                icon={Wrench}
                delay={0.58}
              />

              <StatCard
                label="Të ardhura"
                value="€18,920"
                change="+14.2%"
                icon={CircleDollarSign}
                delay={0.66}
              />
            </div>

            <motion.div
              className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.04)]"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 18,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.72,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-950 sm:text-sm">
                    Programi i sotëm
                  </h4>

                  <p className="mt-0.5 text-[9px] text-slate-500 sm:text-[10px]">
                    12 termine të planifikuara
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-2.5 py-2 text-[9px] font-bold text-blue-600 sm:text-[10px]">
                  Shiko kalendarin
                </span>
              </div>

              <div className="space-y-2">
                {appointments.map((appointment, index) => (
                  <motion.div
                    key={`${appointment.vehicle}-${appointment.time}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5"
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            x: 14,
                          }
                    }
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.82 + index * 0.08,
                    }}
                  >
                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-white shadow-sm">
                      <Clock3 size={12} className="text-blue-600" />

                      <span className="mt-0.5 text-[8px] font-black text-slate-700">
                        {appointment.time}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-black text-slate-950 sm:text-xs">
                        {appointment.vehicle}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-[10px]">
                        {appointment.service}
                      </p>
                    </div>

                    <span className="hidden rounded-full bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-600 sm:inline-flex">
                      {appointment.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
