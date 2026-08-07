"use client";

import { Check, FileSpreadsheet, MessageSquareText, NotebookTabs, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const before = [
  "Terminet në telefon ose WhatsApp",
  "Historiku i automjetit në fletore",
  "Pjesët dhe stoku në Excel",
  "Faturat dhe pagesat të shkëputura",
];

const after = [
  "Një kalendar për të gjithë ekipin",
  "Dosje dixhitale për çdo automjet",
  "Stok i lidhur me urdhër-punët",
  "Financa të përditësuara nga pagesat reale",
];

export default function WorkshopStorySection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65 }}
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Nga puna e përditshme</p>
            <h2 className="mt-4 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Më pak administrim. Më shumë kontroll mbi servisin.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              AutoFlow zëvendëson kombinimin e Excel-it, fletoreve, mesazheve dhe kujtesës personale me një rrjedhë pune ku informacioni kalon nga termini te servisi, pjesët, fatura dhe klienti.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-rose-100 bg-rose-50/55 p-6">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[FileSpreadsheet, MessageSquareText, NotebookTabs].map((Icon, index) => (
                    <span key={index} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-rose-50 bg-white text-rose-500 shadow-sm">
                      <Icon size={16} />
                    </span>
                  ))}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-500">Pa AutoFlow</p>
              </div>
              <div className="mt-6 space-y-4">
                {before.map((item) => (
                  <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-rose-500"><X size={11} strokeWidth={3} /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-blue-200 bg-blue-600 p-6 text-white shadow-[0_20px_55px_rgba(37,99,235,0.18)]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-100">Me AutoFlow</p>
              <div className="mt-6 space-y-4">
                {after.map((item) => (
                  <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-white">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"><Check size={11} strokeWidth={3} /></span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-blue-50">
                Një burim i vetëm informacioni për pronarin, recepsionin dhe mekanikët.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
