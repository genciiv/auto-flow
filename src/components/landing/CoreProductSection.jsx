"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  CarFront,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileText,
  MessageSquareText,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const features = [
  { number: "01", icon: CalendarDays, title: "Terminet", text: "Planifiko vizitat, shmang konfliktet dhe nis shërbimin direkt nga kalendari." },
  { number: "02", icon: Wrench, title: "Urdhër-punët", text: "Mbaj problemin, diagnozën, punët, pjesët dhe statusin në të njëjtën fletë pune." },
  { number: "03", icon: UsersRound, title: "Klientët & automjetet", text: "Historik i plotë për klientin, automjetin, kilometrat, serviset dhe dokumentet." },
  { number: "04", icon: Boxes, title: "Inventari", text: "Shiko stokun real, lëvizjet, furnizimet dhe pjesët e përdorura në çdo shërbim." },
  { number: "05", icon: FileText, title: "Faturat", text: "Krijo faturën nga puna reale dhe ndiq pagesat pa llogaritje të dyfishta." },
  { number: "06", icon: CircleDollarSign, title: "Financat", text: "Ndaj faturimin nga arkëtimet dhe shiko fitimin operativ nga të dhënat reale." },
  { number: "07", icon: MessageSquareText, title: "Komunikimi", text: "Mbaj bisedat me klientin të lidhura me automjetin dhe kontekstin e punës." },
  { number: "08", icon: ChartNoAxesCombined, title: "Raportet", text: "Shiko trendet, punën e ekipit, inventarin dhe performancën nga një dashboard." },
];

const workflow = [
  ["01", "Rezervimi"],
  ["02", "Automjeti"],
  ["03", "Job Card"],
  ["04", "Pjesët"],
  ["05", "Fatura"],
  ["06", "Pagesa"],
  ["07", "Customer Portal"],
];

export default function CoreProductSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      <section id="features" className="bg-[#f7f9fc] py-20 sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Funksionet kryesore</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Gjithçka që përdor çdo ditë, e lidhur në një sistem.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Çdo modul ushqen tjetrin me të dhëna. Nuk kopjon informacion nga një ekran te tjetri dhe nuk humbet historikun e punës.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-200 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ number, icon: Icon, title, text }, index) => (
              <motion.article
                key={title}
                className="group min-h-[255px] bg-white p-6 transition duration-300 hover:bg-blue-50/45"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.035 }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon size={19} />
                  </span>
                  <span className="text-[11px] font-black tracking-[0.16em] text-slate-300">{number}</span>
                </div>
                <h3 className="mt-7 text-xl font-black tracking-[-0.03em] text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="overflow-hidden bg-slate-950 py-20 text-white sm:py-24">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-300">Rrjedha AutoFlow</p>
              <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-5xl">Nga rezervimi te pagesa, pa ndërprerje.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-slate-300 lg:justify-self-end">
              Informacioni ecën me punën. Termini bëhet shërbim, shërbimi përdor pjesët, fatura merr totalin real dhe klienti sheh historikun në portalin e vet.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
            {workflow.map(([number, title], index) => (
              <div key={title} className="relative rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <span className="text-[10px] font-black tracking-[0.18em] text-blue-300">{number}</span>
                <p className="mt-5 text-sm font-black text-white">{title}</p>
                {index < workflow.length - 1 ? <ArrowRight size={15} className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-blue-400 lg:block" /> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-blue-50 p-6 sm:p-8">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl" />
            <div className="relative rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_25px_60px_rgba(15,23,42,0.10)]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><CarFront size={19} /></span>
                  <div><p className="text-sm font-black text-slate-950">Dosja ime e automjetit</p><p className="mt-1 text-xs text-slate-400">Customer Portal</p></div>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-600">NË RREGULL</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Historiku i servisit", "Mirëmbajtja", "Dokumentet", "Shpenzimet"].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">{item}</p><div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 w-2/3 rounded-full bg-blue-500" /></div></div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Edhe klienti është pjesë e rrjedhës</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl">Një eksperiencë më profesionale pas dorëzimit të çelësave.</h2>
            <p className="mt-6 text-base leading-8 text-slate-600">
              Customer Portal i jep klientit historikun e automjetit, mirëmbajtjet, dokumentet, njoftimet dhe komunikimin me biznesin — pa telefonata të panevojshme.
            </p>
            <div className="mt-7 space-y-3">
              {["Health status dhe veprimet e ardhshme", "Dokumente private me reminder skadence", "Historik kilometrash, shpenzimesh dhe servisesh", "Mesazhe të lidhura me automjetin"].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-bold text-slate-700"><ShieldCheck size={18} className="text-blue-600" />{item}</div>
              ))}
            </div>
            <Link href="/apply" className="group mt-8 inline-flex items-center gap-2 text-sm font-black text-blue-600">Apliko për AutoFlow <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
