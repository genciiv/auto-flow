"use client";

import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CarFront,
  ChartNoAxesCombined,
  Check,
  CircleDollarSign,
  Clock3,
  FileText,
  Package,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const customers = [
  {
    initials: "AH",
    name: "Arben Hoxha",
    vehicle: "BMW X5",
  },
  {
    initials: "EK",
    name: "Erisa Kola",
    vehicle: "Audi A4",
  },
  {
    initials: "GM",
    name: "Genti Mema",
    vehicle: "VW Golf 7",
  },
];

const appointments = [
  {
    time: "09:30",
    customer: "Arben Hoxha",
    service: "Ndërrim vaji",
  },
  {
    time: "11:00",
    customer: "Erisa Kola",
    service: "Diagnostikim",
  },
  {
    time: "13:45",
    customer: "Genti Mema",
    service: "Sistem frenimi",
  },
];

const inventoryItems = [
  {
    name: "Vaj motori 5W-30",
    stock: 24,
    status: "Në stok",
  },
  {
    name: "Ferodo frenash",
    stock: 6,
    status: "Stok i ulët",
  },
  {
    name: "Filtër ajri",
    stock: 18,
    status: "Në stok",
  },
];

function SectionBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
      <Boxes size={15} />
      Platforma e plotë
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  description,
  colorClass = "bg-blue-50 text-blue-600",
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${colorClass}`}
        >
          <Icon size={20} />
        </div>

        <h3 className="mt-5 text-2xl font-black tracking-[-0.035em] text-slate-950">
          {title}
        </h3>

        <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition group-hover:border-blue-200 group-hover:text-blue-600">
        <ArrowRight size={16} />
      </div>
    </div>
  );
}

function ServiceWorkflowCard() {
  const statuses = [
    {
      label: "Rezervuar",
      active: true,
    },
    {
      label: "Në proces",
      active: true,
    },
    {
      label: "Gati",
      active: false,
    },
    {
      label: "Faturuar",
      active: false,
    },
  ];

  return (
    <motion.article
      className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-8 lg:col-span-2"
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
        amount: 0.2,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-100/60 blur-[80px]" />

      <div className="relative grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <CardHeader
          icon={Wrench}
          title="Menaxhimi i servisit"
          description="Organizo çdo punë nga rezervimi deri te përfundimi, me status, mekanik, pjesë dhe kosto."
        />

        <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-slate-400">
                Urdhër pune
              </p>

              <h4 className="mt-2 text-lg font-black text-slate-950">
                BMW X5 · Ndërrim vaji
              </h4>

              <p className="mt-1 text-xs text-slate-500">AF-2026-0418</p>
            </div>

            <div className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-bold text-amber-700">
              Në proces
            </div>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2">
            {statuses.map((status, index) => (
              <div key={status.label} className="relative text-center">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full ${
                    status.active
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-400"
                  }`}
                >
                  {status.active ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-black">{index + 1}</span>
                  )}
                </div>

                <p className="mt-2 text-[9px] font-bold text-slate-500 sm:text-[10px]">
                  {status.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Mekaniku",
                value: "Erion Kola",
                icon: UserRound,
              },
              {
                label: "Kohëzgjatja",
                value: "1h 30min",
                icon: Clock3,
              },
              {
                label: "Vlera",
                value: "8,500 Lek",
                icon: CircleDollarSign,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-3.5"
                >
                  <div className="flex items-center gap-2 text-slate-400">
                    <Icon size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em]">
                      {item.label}
                    </span>
                  </div>

                  <p className="mt-2 text-xs font-black text-slate-900">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function CustomersCard() {
  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-7"
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
        amount: 0.2,
      }}
      transition={{
        duration: 0.7,
        delay: 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <CardHeader
        icon={UsersRound}
        title="Klientët dhe automjetet"
        description="Profile të plota, historik servisi dhe çdo automjet i lidhur me pronarin."
        colorClass="bg-cyan-50 text-cyan-600"
      />

      <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-400">
          <Search size={14} />
          <span className="text-[10px] font-medium">
            Kërko klient ose automjet...
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {customers.map((customer, index) => (
            <motion.div
              key={customer.name}
              className="flex items-center gap-3 rounded-xl bg-white p-3"
              initial={{
                opacity: 0,
                x: 14,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.2 + index * 0.08,
              }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[10px] font-black text-cyan-700">
                {customer.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-950">
                  {customer.name}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {customer.vehicle}
                </p>
              </div>

              <CarFront size={15} className="text-slate-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function AppointmentsCard() {
  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.17)] sm:p-7"
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
        amount: 0.2,
      }}
      transition={{
        duration: 0.7,
        delay: 0.14,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
            <CalendarDays size={20} />
          </div>

          <h3 className="mt-5 text-2xl font-black tracking-[-0.035em]">
            Rezervime inteligjente
          </h3>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            Organizim i termineve dhe kapacitetit të ekipit.
          </p>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-blue-200">
          Sot
        </span>
      </div>

      <div className="mt-7 space-y-2.5">
        {appointments.map((appointment, index) => (
          <motion.div
            key={`${appointment.time}-${appointment.customer}`}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm"
            initial={{
              opacity: 0,
              x: 15,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.22 + index * 0.08,
            }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-[10px] font-black text-blue-300">
              {appointment.time}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-black text-white">
                {appointment.customer}
              </p>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {appointment.service}
              </p>
            </div>

            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
          </motion.div>
        ))}
      </div>
    </motion.article>
  );
}

function InventoryCard() {
  return (
    <motion.article
      className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] sm:p-7"
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
        amount: 0.2,
      }}
      transition={{
        duration: 0.7,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <CardHeader
        icon={Package}
        title="Magazina e pjesëve"
        description="Stok, lëvizje, kosto dhe njoftime për pjesët që po mbarojnë."
        colorClass="bg-amber-50 text-amber-600"
      />

      <div className="mt-7 space-y-2.5">
        {inventoryItems.map((item) => {
          const lowStock = item.stock <= 6;

          return (
            <div
              key={item.name}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <Package size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-950">
                  {item.name}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  {item.stock} njësi
                </p>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                  lowStock
                    ? "bg-red-50 text-red-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </motion.article>
  );
}

function FinanceCard() {
  return (
    <motion.article
      className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.07)] sm:p-8 lg:col-span-2"
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
        amount: 0.2,
      }}
      transition={{
        duration: 0.7,
        delay: 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-emerald-100/60 blur-[90px]" />

      <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <CardHeader
          icon={ChartNoAxesCombined}
          title="Financa dhe raporte"
          description="Fatura, pagesa dhe performanca e biznesit tënd në një pamje të qartë."
          colorClass="bg-emerald-50 text-emerald-600"
        />

        <div className="rounded-[1.6rem] border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Të ardhurat mujore
              </p>

              <p className="mt-2 text-3xl font-black tracking-tight">
                1,892,000 Lek
              </p>

              <p className="mt-2 text-[10px] font-bold text-emerald-400">
                +14.2% krahasuar me muajin e kaluar
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
              <CircleDollarSign size={18} />
            </div>
          </div>

          <div className="mt-8 flex h-36 items-end gap-2">
            {[40, 54, 48, 68, 61, 78, 72, 92, 86, 100, 94, 112].map(
              (height, index) => (
                <motion.div
                  key={`${height}-${index}`}
                  className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400"
                  initial={{
                    height: 0,
                  }}
                  whileInView={{
                    height,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 0.18 + index * 0.04,
                  }}
                />
              ),
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              {
                label: "Fatura",
                value: "128",
                icon: FileText,
              },
              {
                label: "Paguar",
                value: "104",
                icon: ShieldCheck,
              },
              {
                label: "Në pritje",
                value: "24",
                icon: Clock3,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <Icon size={14} className="text-blue-300" />

                  <p className="mt-2 text-base font-black">{item.value}</p>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="relative scroll-mt-[76px] overflow-hidden bg-slate-50 py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-blue-100/30 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(148,163,184,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.11)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 24,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <SectionBadge />

          <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            Një platformë për çdo proces të biznesit.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            AutoFlow bashkon operacionet e përditshme në një sistem të vetëm,
            nga klienti i parë deri te raporti financiar.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 lg:grid-cols-2">
          <ServiceWorkflowCard />
          <CustomersCard />
          <AppointmentsCard />
          <InventoryCard />
          <FinanceCard />
        </div>

        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-3">
          {[
            {
              icon: ShieldCheck,
              label: "Të dhëna të sigurta",
            },
            {
              icon: UsersRound,
              label: "Role për ekipin",
            },
            {
              icon: CarFront,
              label: "Historik automjetesh",
            },
            {
              icon: FileText,
              label: "Fatura profesionale",
            },
            {
              icon: Package,
              label: "Kontroll magazine",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 shadow-sm"
              >
                <Icon size={14} className="text-blue-600" />
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
