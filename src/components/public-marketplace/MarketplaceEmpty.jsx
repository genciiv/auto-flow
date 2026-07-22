import Link from "next/link";
import { PackageSearch, RotateCcw } from "lucide-react";

export default function MarketplaceEmpty() {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <PackageSearch size={30} />
      </div>

      <h2 className="mt-6 text-xl font-bold text-slate-950">
        Nuk u gjet asnjë publikim
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Provo të ndryshosh fjalën e kërkimit, llojin e publikimit ose qytetin.
      </p>

      <Link
        href="/marketplace"
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700"
      >
        <RotateCcw size={17} />
        Pastro filtrat
      </Link>
    </div>
  );
}
