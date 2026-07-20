import { redirect } from "next/navigation";

import {
  BarChart3,
  CarFront,
  CheckCircle2,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import { auth } from "@/auth";

import LoginForm from "./login-form";

export const metadata = {
  title: "Hyr në AutoFlow",
  description: "Hyr në platformën AutoFlow për të menaxhuar servisin tuaj.",
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

export default async function LoginPage() {
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
                <p className="text-xs text-slate-400">
                  Auto Service Management
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
              <ShieldCheck className="size-4" />
              Platformë e sigurt për servisin tuaj
            </div>

            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              Menaxho çdo pjesë të servisit nga një platformë e vetme.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Klientë, automjete, shërbime, magazinë, termine dhe fatura në një
              sistem të organizuar.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Wrench className="mb-4 size-5 text-slate-300" />
                <p className="text-sm font-medium">Shërbime</p>
                <p className="mt-1 text-xs text-slate-400">Menaxhim i plotë</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <BarChart3 className="mb-4 size-5 text-slate-300" />
                <p className="text-sm font-medium">Analitika</p>
                <p className="mt-1 text-xs text-slate-400">
                  Të dhëna në kohë reale
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mb-4 size-5 text-slate-300" />
                <p className="text-sm font-medium">Kontroll</p>
                <p className="mt-1 text-xs text-slate-400">
                  Çdo proces në një vend
                </p>
              </div>
            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} AutoFlow. Të gjitha të drejtat e
            rezervuara.
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <CarFront className="size-5" />
              </div>

              <div>
                <p className="font-bold text-slate-950">AutoFlow</p>
                <p className="text-xs text-slate-500">
                  Auto Service Management
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Mirë se u riktheve
                </p>

                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  Hyr në llogarinë tënde
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Përdor email-in dhe password-in e llogarisë AutoFlow.
                </p>
              </div>

              <LoginForm />
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">
              Duke vazhduar, pranon kushtet e përdorimit dhe politikën e
              privatësisë.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
