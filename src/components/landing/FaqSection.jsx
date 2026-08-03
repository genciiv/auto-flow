"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";

const faqs = [
  {
    question: "A është AutoFlow vetëm për servise?",
    answer:
      "Jo. Platforma është projektuar për servise, gomisteri, autoelektrikë, dyqane pjesësh, shitës automjetesh dhe biznese të tjera automotive.",
  },
  {
    question: "A mund të shtoj stafin dhe role të ndryshme?",
    answer:
      "Po. Pronari mund të shtojë ekipin dhe të caktojë role sipas përgjegjësive të secilit përdorues.",
  },
  {
    question: "A mund të menaxhoj klientët dhe automjetet?",
    answer:
      "Po. Çdo klient ka profilin e tij, automjetet e lidhura, historikun e servisit, rezervimet dhe faturat.",
  },
  {
    question: "A ka magazinë për pjesët?",
    answer:
      "Po. AutoFlow përfshin menaxhimin e stokut, pjesëve, çmimeve dhe njoftimeve kur stoku është i ulët.",
  },
  {
    question: "A përfshihet modulet e biznesit?",
    answer:
      "Po. modulet e biznesit lejon publikimin dhe kërkimin e automjeteve, pjesëve, pajisjeve dhe shërbimeve automotive.",
  },
  {
    question: "A mund ta përdor nga telefoni?",
    answer:
      "Po. Platforma është responsive dhe mund të përdoret nga kompjuteri, tableti dhe telefoni.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-slate-50 py-24 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-blue-100/45 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 25,
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
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">
            <HelpCircle size={15} />
            Pyetje të shpeshta
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            Gjithçka që duhet të dish para se të fillosh.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Përgjigje të qarta për mënyrën si funksionon AutoFlow dhe si mund të
            përdoret nga biznesi yt.
          </p>
        </motion.div>

        <div className="mt-14 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.article
                key={faq.question}
                className={`overflow-hidden rounded-2xl border bg-white transition ${
                  isOpen
                    ? "border-blue-200 shadow-[0_20px_60px_rgba(37,99,235,0.09)]"
                    : "border-slate-200 shadow-sm"
                }`}
                initial={{
                  opacity: 0,
                  y: 20,
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
                  delay: index * 0.05,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-7 sm:py-6"
                >
                  <span className="text-base font-black text-slate-950 sm:text-lg">
                    {faq.question}
                  </span>

                  <motion.span
                    animate={{
                      rotate: isOpen ? 180 : 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isOpen
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <ChevronDown size={17} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{
                        height: 0,
                        opacity: 0,
                      }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{
                        duration: 0.32,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <p className="border-t border-slate-100 px-5 py-5 text-sm leading-7 text-slate-600 sm:px-7 sm:text-base">
                        {faq.answer}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
