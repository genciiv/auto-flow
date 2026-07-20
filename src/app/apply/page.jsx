import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import BusinessApplicationForm from "@/components/applications/BusinessApplicationForm";

const benefits = [
  {
    icon: Wrench,
    title: "Menaxhim i servisit",
    description: "Shërbime, termine, klientë dhe automjete në një platformë.",
  },
  {
    icon: BarChart3,
    title: "Raporte të qarta",
    description:
      "Monitoro të ardhurat, performancën dhe aktivitetin e biznesit.",
  },
  {
    icon: ShieldCheck,
    title: "Të dhëna të sigurta",
    description: "Çdo biznes ka hapësirën dhe përdoruesit e vet.",
  },
];

export const metadata = {
  title: "Apliko për AutoFlow",
  description: "Apliko për të përdorur platformën AutoFlow në servisin tënd.",
};

export default function ApplyPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Kthehu në faqen kryesore
        </Link>

        <div className="grid gap-12 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <section className="lg:sticky lg:top-12">
            <p className="text-sm font-semibold text-blue-600">
              AutoFlow për biznesin tënd
            </p>

            <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Modernizo menaxhimin e servisit tënd.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Dërgo aplikimin dhe ekipi ynë do të të ndihmojë të konfigurosh
              biznesin në AutoFlow.
            </p>

            <div className="mt-8 space-y-4">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Icon size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-950">
                        {benefit.title}
                      </h2>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-blue-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={22} />

                <p className="font-bold">Pa pagesë gjatë aplikimit</p>
              </div>

              <p className="mt-3 text-sm leading-6 text-blue-100">
                Llogaria krijohet vetëm pasi aplikimi të aprovohet nga ekipi i
                AutoFlow.
              </p>
            </div>
          </section>

          <BusinessApplicationForm />
        </div>
      </div>
    </main>
  );
}
