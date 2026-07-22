import Link from "next/link";
import { ArrowLeft, PackageSearch } from "lucide-react";

import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function MarketplaceListingNotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <Header />

      <section className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PackageSearch size={30} />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
            Publikimi nuk u gjet
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Ky publikim nuk është më i disponueshëm
          </h1>

          <p className="mt-4 leading-7 text-slate-500">
            Publikimi mund të jetë fshirë, arkivuar, shitur ose adresa mund të
            jetë shkruar gabim.
          </p>

          <Link
            href="/marketplace"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={17} />
            Kthehu te Marketplace
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
