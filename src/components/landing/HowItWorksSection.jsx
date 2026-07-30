"use client";

import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CarFront,
  CheckCircle2,
  LineChart,
  UsersRound,
  Wrench,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Krijo hapësirën e biznesit",
    description:
      "Konfiguro profilin, orarin, shërbimet dhe informacionet bazë të biznesit.",
    icon: Building2,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    previewTitle: "Auto Service Tirana",
    items: [
      "Profili i biznesit u krijua",
      "Orari i punës u konfigurua",
      "Shërbimet u publikuan",
    ],
  },
  {
    number: "02",
    title: "Shto ekipin dhe klientët",
    description:
      "Organizo stafin, klientët dhe automjetet e lidhura me historikun e tyre.",
    icon: UsersRound,
    color: "bg-violet-50 text-violet-600 border-violet-100",
    previewTitle: "Klientët dhe automjetet",
    items: [
      "Stafi mori rolet përkatëse",
      "Klientët u regjistruan",
      "Automjetet u lidhën me pronarët",
    ],
  },
  {
    number: "03",
    title: "Menaxho rrjedhën e punës",
    description:
      "Rezervimet, serviset, pjesët dhe faturat kalojnë në një proces të vetëm.",
    icon: Wrench,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    previewTitle: "BMW X5 · Servis aktiv",
    items: [
      "Rezervimi u konfirmua",
      "Automjeti hyri në servis",
      "Fatura po përgatitet",
    ],
  },
  {
    number: "04",
    title: "Monitoro dhe rrit biznesin",
    description:
      "Analizo të ardhurat, aktivitetin dhe performancën për të marrë vendime më të mira.",
    icon: LineChart,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    previewTitle: "+14.2% rritje mujore",
    items: [
      "Më shumë rezervime",
      "Më pak punë manuale",
      "Kontroll më i mirë financiar",
    ],
  },
];

function StepPreview({ step, index }) {
  const Icon = step.icon;

  return (
    <motion.div
      className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-7"
      initial={{
        opacity: 0,
        scale: 0.95,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        duration: 0.75,
        delay: 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -5,
      }}
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-100/60 blur-[70px]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Hapi {step.number}
            </p>

            <h4 className="mt-2 text-xl font-black tracking-tight text-slate-950">
              {step.previewTitle}
            </h4>
          </div>

          <motion.div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${step.color}`}
            animate={{
              rotate: index % 2 === 0 ? [0, 3, 0] : [0, -3, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={21} />
          </motion.div>
        </div>

        <div className="mt-6 space-y-3">
          {step.items.map((item, itemIndex) => (
            <motion.div
              key={item}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5"
              initial={{
                opacity: 0,
                x: 18,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.2 + itemIndex * 0.09,
              }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <CheckCircle2 size={15} />
              </div>

              <p className="text-xs font-bold text-slate-700 sm:text-sm">
                {item}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function WorkflowStep({ step, index }) {
  const Icon = step.icon;

  return (
    <motion.article
      className="relative"
      initial={{
        opacity: 0,
        y: 40,
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
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="grid items-center gap-9 lg:grid-cols-2 lg:gap-20">
        <div className={index % 2 === 1 ? "lg:order-2" : ""}>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${step.color}`}
            >
              <Icon size={21} />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              Hapi {step.number}
            </p>
          </div>

          <h3 className="mt-6 max-w-xl text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            {step.title}
          </h3>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
            {step.description}
          </p>

          <div className="mt-7 inline-flex items-center gap-2 text-sm font-black text-slate-950">
            Një proces i organizuar
            <ArrowRight size={16} className="text-blue-600" />
          </div>
        </div>

        <div className={index % 2 === 1 ? "lg:order-1" : ""}>
          <StepPreview step={step} index={index} />
        </div>
      </div>

      {index < steps.length - 1 ? (
        <div className="my-14 flex justify-center lg:my-20">
          <div className="relative h-20 w-px overflow-hidden bg-slate-200">
            <motion.div
              className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-blue-500 to-cyan-300"
              animate={{
                y: [-40, 80],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </div>
        </div>
      ) : null}
    </motion.article>
  );
}

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden bg-white py-24 sm:py-28"
    >
      <motion.div
        style={{
          y: shouldReduceMotion ? 0 : backgroundY,
        }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute -left-40 top-[20%] h-[420px] w-[420px] rounded-full bg-blue-100/40 blur-[120px]" />

        <div className="absolute -right-40 top-[58%] h-[440px] w-[440px] rounded-full bg-violet-100/35 blur-[130px]" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.24] [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_88%,transparent)]" />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
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
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            <CalendarCheck2 size={15} />
            Si funksionon
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            Nga konfigurimi te rritja, pa procese të komplikuara.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            AutoFlow të udhëheq nga krijimi i biznesit deri te menaxhimi i
            përditshëm dhe analiza e performancës.
          </p>
        </motion.div>

        <div className="mt-16 sm:mt-20">
          {steps.map((step, index) => (
            <WorkflowStep key={step.number} step={step} index={index} />
          ))}
        </div>

        <motion.div
          className="relative mx-auto mt-20 max-w-5xl overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 px-6 py-10 text-white shadow-[0_35px_100px_rgba(15,23,42,0.22)] sm:px-10 lg:px-12"
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.98,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          viewport={{
            once: true,
            amount: 0.25,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-blue-500/20 blur-[90px]" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                Një sistem i vetëm
              </p>

              <h3 className="mt-3 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
                Çdo veprim përditëson pjesën tjetër të biznesit.
              </h3>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Rezervimi lidhet me klientin dhe automjetin. Servisi përdor
                pjesët nga magazina. Fatura lidhet me pagesën dhe gjithçka ruhet
                në historik.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: CalendarCheck2,
                  label: "Rezervim",
                },
                {
                  icon: Wrench,
                  label: "Servis",
                },
                {
                  icon: CarFront,
                  label: "Historik",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    className="flex min-w-[88px] flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-sm"
                    animate={{
                      y: [0, index % 2 === 0 ? -6 : 6, 0],
                    }}
                    transition={{
                      duration: 4 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                      <Icon size={18} />
                    </div>

                    <span className="mt-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                      {item.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
