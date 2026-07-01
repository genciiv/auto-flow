import { Car } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Car size={22} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-950">AutoFlow</h3>
            <p className="mt-1 text-sm text-slate-500">
              Platforma moderne për industrinë automotive në Shqipëri.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-slate-950">
            Features
          </a>
          <a href="#marketplace" className="hover:text-slate-950">
            Marketplace
          </a>
          <a href="#pricing" className="hover:text-slate-950">
            Pricing
          </a>
          <a href="mailto:info@autoflow.al" className="hover:text-slate-950">
            info@autoflow.al
          </a>
        </div>
      </div>
    </footer>
  );
}
