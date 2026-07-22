import { AlignLeft } from "lucide-react";

export default function MarketplaceDescription({ description }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <AlignLeft size={19} />
        </div>

        <h2 className="text-xl font-bold text-slate-950">Përshkrimi</h2>
      </div>

      {description ? (
        <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
          {description}
        </p>
      ) : (
        <p className="mt-6 text-base text-slate-500">
          Shitësi nuk ka shtuar një përshkrim për këtë publikim.
        </p>
      )}
    </section>
  );
}
