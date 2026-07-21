import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export default function MarketplaceProductActions({ listingId }) {
  return (
    <Link
      href={`/dashboard/marketplace/${listingId}`}
      aria-label="Menaxho publikimin"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:bg-white"
    >
      <MoreHorizontal size={18} className="text-slate-600" />
    </Link>
  );
}
