import { Car } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Car size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">AutoFlow</span>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-slate-950">
            Features
          </a>
          <a href="#marketplace" className="hover:text-slate-950">
            Marketplace
          </a>
          <a href="#pricing" className="hover:text-slate-950">
            Pricing
          </a>
          <a href="#contact" className="hover:text-slate-950">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 md:block">
            Login
          </button>
          <button className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}
