import Link from "next/link";

import { ArrowLeft, CarFront, ShieldCheck } from "lucide-react";

import CustomerVehicleForm from "@/components/customer/CustomerVehicleForm";
import { createCustomerVehicle } from "@/app/customer/vehicles/actions";
import { requireCustomerContext } from "@/lib/customer-context";

export const metadata = {
  title: "Shto automjet | AutoFlow",
};

export default async function NewCustomerVehiclePage() {
  await requireCustomerContext();

  return (
    <div className="space-y-7">
      <div>
        <Link
          href="/customer/vehicles"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Kthehu te makinat
        </Link>
      </div>

      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
        <div className="relative">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/15 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
              <CarFront size={14} />
              Automjet i ri
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Shto automjet
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Regjistro të dhënat kryesore dhe teknike të makinës tënde.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.34fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-bold text-slate-950">
              Të dhënat e automjetit
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Plotëso informacionin që ke në dispozicion.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <CustomerVehicleForm
              action={createCustomerVehicle}
              submitLabel="Shto automjetin"
            />
          </div>
        </div>

        <aside className="h-fit rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
            <ShieldCheck size={21} />
          </div>

          <h2 className="mt-4 text-sm font-bold text-slate-950">
            Informacion privat
          </h2>

          <p className="mt-2 text-xs leading-6 text-slate-600">
            Të dhënat e automjetit do të jenë të dukshme vetëm në llogarinë
            tënde dhe te shërbimet që do të autorizosh në të ardhmen.
          </p>
        </aside>
      </section>
    </div>
  );
}
