import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

export default function MarketplaceDetailsLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 h-4 w-44 animate-pulse rounded bg-slate-200" />

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
          <div>
            <div className="aspect-[16/11] animate-pulse rounded-[2rem] bg-slate-200" />

            <div className="mt-4 grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>

            <div className="mt-8 h-56 animate-pulse rounded-[2rem] bg-white" />
            <div className="mt-6 h-80 animate-pulse rounded-[2rem] bg-white" />
          </div>

          <div className="h-[620px] animate-pulse rounded-[2rem] bg-white" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
