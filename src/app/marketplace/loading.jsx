import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

function MarketplaceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
      <div className="aspect-[16/11] animate-pulse bg-slate-200" />

      <div className="space-y-4 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="grid grid-cols-2 gap-3">
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-px bg-slate-100" />

        <div className="h-7 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        <div className="h-11 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export default function MarketplaceLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="bg-slate-950 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto h-8 w-44 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mt-6 h-12 max-w-2xl animate-pulse rounded bg-white/10" />
            <div className="mx-auto mt-4 h-6 max-w-xl animate-pulse rounded bg-white/5" />
          </div>

          <div className="mx-auto mt-10 h-24 max-w-5xl animate-pulse rounded-[2rem] bg-white/10" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 h-24 animate-pulse rounded-2xl bg-white" />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <MarketplaceCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
