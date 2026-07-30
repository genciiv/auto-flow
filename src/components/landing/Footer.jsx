"use client";

import Link from "next/link";
import { ArrowRight, CarFront, Mail, MapPin, Phone } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import CookieSettingsButton from "@/components/legal/CookieSettingsButton";
import { scrollToLandingSection } from "@/components/landing/LandingNavigationLinks";

const platformLinks = [
  {
    label: "Platforma",
    targetId: "platform",
  },
  {
    label: "Si funksionon",
    targetId: "how-it-works",
  },
  {
    label: "Modulet",
    targetId: "features",
  },
  {
    label: "Çmimet",
    targetId: "pricing",
  },
];

const resourceLinks = [
  {
    label: "Marketplace",
    href: "/marketplace",
  },
  {
    label: "Apliko për AutoFlow",
    href: "/apply",
  },
  {
    label: "Hyr në llogari",
    href: "/login",
  },
  {
    label: "Pyetje të shpeshta",
    targetId: "faq",
  },
];

const legalLinks = [
  {
    label: "Privatësia",
    href: "/privacy",
  },
  {
    label: "Kushtet e përdorimit",
    href: "/terms",
  },
  {
    label: "Politika e cookies",
    href: "/cookies",
  },
];

function FooterLink({ item }) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className="inline-flex text-sm font-medium text-slate-400 transition duration-200 hover:translate-x-1 hover:text-white"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => scrollToLandingSection(item.targetId)}
      className="text-left text-sm font-medium text-slate-400 transition duration-200 hover:translate-x-1 hover:text-white"
    >
      {item.label}
    </button>
  );
}

export default function Footer() {
  const shouldReduceMotion = useReducedMotion();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="relative overflow-hidden bg-slate-950 text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-10 h-[360px] w-[360px] rounded-full bg-blue-600/15 blur-[120px]" />

        <div className="absolute -right-32 bottom-0 h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-8">
        <motion.div
          className="border-b border-white/10 py-12 sm:py-14"
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
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-300">
                AutoFlow
              </p>

              <h2 className="mt-4 max-w-2xl text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                Organizo biznesin automotive në një sistem të vetëm.
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Menaxho klientët, automjetet, serviset, rezervimet, faturat,
                magazinën dhe marketplace-in nga një platformë moderne.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href="/apply"
                className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-black text-white shadow-lg shadow-blue-600/25 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Fillo falas
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-black text-white backdrop-blur-sm transition duration-200 hover:border-white/25 hover:bg-white/10"
              >
                Hyr në llogari
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.8fr]">
          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-3"
              aria-label="AutoFlow - Faqja kryesore"
            >
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 transition-transform duration-300 group-hover:scale-110" />

                <CarFront size={22} className="relative z-10" />
              </div>

              <div>
                <p className="text-xl font-black tracking-[-0.03em] text-white">
                  AutoFlow
                </p>

                <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Automotive platform
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Platformë profesionale për menaxhimin e bizneseve automotive në
              Shqipëri dhe më gjerë.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href="mailto:info@autoflow.al"
                className="flex items-center gap-3 text-sm text-slate-400 transition duration-200 hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                  <Mail size={16} />
                </span>

                <span>info@autoflow.al</span>
              </a>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                  <Phone size={16} />
                </span>

                <span>Support sipas planit</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-blue-300">
                  <MapPin size={16} />
                </span>

                <span>Shqipëri</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-200">
              Platforma
            </h3>

            <div className="mt-5 flex flex-col items-start gap-3">
              {platformLinks.map((item) => (
                <FooterLink key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-200">
              Burime
            </h3>

            <div className="mt-5 flex flex-col items-start gap-3">
              {resourceLinks.map((item) => (
                <FooterLink key={item.label} item={item} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-200">
              Ligjore
            </h3>

            <div className="mt-5 flex flex-col items-start gap-3">
              {legalLinks.map((item) => (
                <FooterLink key={item.label} item={item} />
              ))}

              <CookieSettingsButton className="inline-flex items-center gap-2 text-left text-sm font-medium text-slate-400 transition duration-200 hover:translate-x-1 hover:text-white" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} AutoFlow. Të gjitha të drejtat e rezervuara.</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/privacy" className="transition hover:text-slate-300">
              Privatësia
            </Link>

            <Link href="/terms" className="transition hover:text-slate-300">
              Kushtet
            </Link>

            <Link href="/cookies" className="transition hover:text-slate-300">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
