import { MoreHorizontal } from "lucide-react";

export default function MarketplaceProductActions() {
  return (
    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-white">
      <MoreHorizontal size={18} className="text-slate-600" />
    </button>
  );
}
