"use client";

import {
  CalendarDays,
  CarFront,
  CircleDollarSign,
  Store,
  UserRound,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const nodes = [
  {
    id: "marketplace",
    label: "Marketplace",
    description: "Produkte, pjesë dhe automjete",
    icon: Store,
    className: "left-1/2 top-0 -translate-x-1/2 md:left-1/2 md:top-2",
    colorClass: "bg-violet-50 text-violet-600",
  },
  {
    id: "services",
    label: "Servise",
    description: "Punë, staf dhe procese",
    icon: Wrench,
    className: "right-0 top-[22%] md:right-2 md:top-[20%]",
    colorClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "payments",
    label: "Pagesa",
    description: "Fatura dhe transaksione",
    icon: CircleDollarSign,
    className: "bottom-[8%] right-[4%] md:bottom-[10%] md:right-[8%]",
    colorClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "appointments",
    label: "Rezervime",
    description: "Termine dhe kalendar",
    icon: CalendarDays,
    className: "bottom-0 left-1/2 -translate-x-1/2 md:bottom-2",
    colorClass: "bg-amber-50 text-amber-600",
  },
  {
    id: "vehicles",
    label: "Makina",
    description: "Automjete dhe histori",
    icon: CarFront,
    className: "bottom-[8%] left-[4%] md:bottom-[10%] md:left-[8%]",
    colorClass: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "customers",
    label: "Klientë",
    description: "Profile dhe komunikim",
    icon: UserRound,
    className: "left-0 top-[22%] md:left-2 md:top-[20%]",
    colorClass: "bg-sky-50 text-sky-600",
  },
];

const paths = [
  {
    id: "top",
    d: "M 400 240 C 400 190, 400 140, 400 92",
  },
  {
    id: "top-right",
    d: "M 455 255 C 520 220, 570 190, 635 170",
  },
  {
    id: "bottom-right",
    d: "M 455 315 C 520 345, 570 385, 625 420",
  },
  {
    id: "bottom",
    d: "M 400 330 C 400 380, 400 430, 400 478",
  },
  {
    id: "bottom-left",
    d: "M 345 315 C 280 345, 230 385, 175 420",
  },
  {
    id: "top-left",
    d: "M 345 255 C 280 220, 230 190, 165 170",
  },
];

function NetworkNode({
  label,
  description,
  icon: Icon,
  className,
  colorClass,
  index,
}) {
  return (
    <motion.div
      className={`absolute z-20 w-[150px] sm:w-[170px] ${className}`}
      initial={{
        opacity: 0,
        scale: 0.9,
        y: 12,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.4,
      }}
      transition={{
        duration: 0.6,
        delay: 0.25 + index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -6,
        scale: 1.03,
      }}
    >
      <div className="group rounded-[1.35rem] border border-slate-200/90 bg-white/95 p-3.5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-300 hover:border-blue-200 hover:shadow-[0_22px_65px_rgba(37,99,235,0.14)]">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorClass}`}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">
              {label}
            </p>

            <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DesktopNetwork() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto hidden h-[560px] w-full max-w-[800px] md:block">
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-100 bg-blue-50/30 blur-[1px]" />

      <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200/70 bg-white/60 shadow-[0_25px_90px_rgba(15,23,42,0.06)] backdrop-blur-xl" />

      <svg
        viewBox="0 0 800 560"
        className="absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="network-line" x1="0" x2="1">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          <filter id="soft-glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {paths.map((path, index) => (
          <g key={path.id}>
            <motion.path
              d={path.d}
              fill="none"
              stroke="url(#network-line)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      pathLength: 0,
                      opacity: 0,
                    }
              }
              whileInView={{
                pathLength: 1,
                opacity: 1,
              }}
              viewport={{
                once: true,
                amount: 0.3,
              }}
              transition={{
                duration: 0.9,
                delay: 0.15 + index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {!shouldReduceMotion ? (
              <motion.circle
                r="5"
                fill="#2563eb"
                filter="url(#soft-glow)"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3.2,
                  delay: index * 0.45,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <animateMotion
                  dur="3.2s"
                  repeatCount="indefinite"
                  path={path.d}
                />
              </motion.circle>
            ) : null}
          </g>
        ))}
      </svg>

      <motion.div
        className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
        transition={{
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-[-18px] rounded-full border border-blue-200"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.08, 1],
                    opacity: [0.5, 0.15, 0.5],
                  }
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-[-34px] rounded-full border border-blue-100"
            animate={
              shouldReduceMotion
                ? undefined
                : {
                    scale: [1, 1.06, 1],
                    opacity: [0.35, 0.08, 0.35],
                  }
            }
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative flex h-[150px] w-[150px] flex-col items-center justify-center rounded-full border border-blue-200/80 bg-white shadow-[0_30px_90px_rgba(37,99,235,0.18)]">
            <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_35%_30%,rgba(96,165,250,0.22),transparent_55%)]" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
              <CarFront size={22} />
            </div>

            <p className="relative mt-3 text-lg font-black tracking-[-0.03em] text-slate-950">
              AutoFlow
            </p>

            <p className="relative mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Connected core
            </p>
          </div>
        </div>
      </motion.div>

      {nodes.map((node, index) => (
        <NetworkNode key={node.id} {...node} index={index} />
      ))}
    </div>
  );
}

function MobileNetwork() {
  return (
    <div className="mx-auto grid max-w-md gap-3 md:hidden">
      <div className="mb-3 rounded-[2rem] border border-blue-200 bg-white p-6 text-center shadow-[0_25px_70px_rgba(37,99,235,0.12)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
          <CarFront size={22} />
        </div>

        <p className="mt-3 text-xl font-black text-slate-950">AutoFlow</p>

        <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Connected core
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {nodes.map((node) => {
          const Icon = node.icon;

          return (
            <div
              key={node.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)]"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${node.colorClass}`}
              >
                <Icon size={18} />
              </div>

              <p className="mt-3 text-sm font-black text-slate-950">
                {node.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {node.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AutoFlowNetwork() {
  return (
    <section
      id="platform"
      className="relative scroll-mt-[60px] overflow-hidden border-y border-slate-200/70 bg-slate-50 py-16 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[680px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/35 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.34] [background-image:linear-gradient(rgba(148,163,184,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.13)_1px,transparent_1px)] [background-size:52px_52px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      </div>

      <div className="relative mx-auto max-w-[1380px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            Ekosistemi AutoFlow
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
            Gjithçka lidhet me gjithçka.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Çdo modul i AutoFlow komunikon me tjetrin. Klienti lidhet me
            automjetin, automjeti me servisin, servisi me faturën dhe pagesa me
            të gjithë historikun e biznesit.
          </p>
        </div>

        <div className="mt-8 sm:mt-10">
          <DesktopNetwork />
          <MobileNetwork />
        </div>
      </div>
    </section>
  );
}
