import { redirect } from "next/navigation";

import { CarFront, Heart, Search, ShieldCheck, Sparkles } from "lucide-react";

import { auth } from "@/auth";

import RegisterForm from "./register-form";

export const metadata = {
  title: "Krijo llogari | AutoFlow",
  description:
    "Krijo llogarinë tënde AutoFlow dhe menaxho automjetet, kërkesat dhe publikimet.",
};

function getUserDestination(user) {
  if (user?.globalRole === "PLATFORM_ADMIN") {
    return "/admin";
  }

  if (user?.globalRole === "CUSTOMER") {
    return "/customer/dashboard";
  }

  if (user?.businessId && user?.businessRole) {
    return "/dashboard";
  }

  return null;
}

export default async function RegisterPage() {
  const session = await auth();

  if (session?.user) {
    const destination = getUserDestination(session.user);

    if (destination) {
      redirect(destination);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-32 top-24 size-80 rounded-full bg-white/5 blur-3xl" />

          <div className="absolute -bottom-32 right-0 size-96 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-950">
                <CarFront className="size-6" />
              </div>

              <div>
                <p className="text-xl font-bold">AutoFlow</p>

                <p className="text-xs text-slate-400">Portali i klientit</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              <Sparkles className="size-4" />
              Llogaria jote personale AutoFlow
            </div>

            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              Automjeti, shërbimet dhe Marketplace në një vend.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Krijo llogarinë për të regjistruar automjetet, për të ruajtur
              publikimet dhe për të kontaktuar bizneset në Marketplace.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <CarFront className="mb-4 size-5 text-slate-300" />

                <p className="text-sm font-medium">Automjetet</p>

                <p className="mt-1 text-xs text-slate-400">
                  Menaxho makinat e tua
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Search className="mb-4 size-5 text-slate-300" />

                <p className="text-sm font-medium">Marketplace</p>

                <p className="mt-1 text-xs text-slate-400">
                  Gjej makina dhe pjesë
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Heart className="mb-4 size-5 text-slate-300" />

                <p className="text-sm font-medium">Favoritet</p>

                <p className="mt-1 text-xs text-slate-400">Ruaj publikimet</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="size-4" />

            <span>
              Të dhënat e tua mbrohen dhe përdoren vetëm brenda AutoFlow.
            </span>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <CarFront className="size-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">AutoFlow</p>

                <p className="text-xs text-slate-500">Portali i klientit</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Fillo me AutoFlow
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Krijo llogarinë tënde
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Regjistrohu falas për të përdorur portalin e klientit dhe
                  Marketplace.
                </p>
              </div>

              <RegisterForm />
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              © {new Date().getFullYear()} AutoFlow. Të gjitha të drejtat e
              rezervuara.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
