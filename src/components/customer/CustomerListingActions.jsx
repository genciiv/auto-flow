"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Archive,
  Edit3,
  Eye,
  MoreHorizontal,
  Send,
  ShoppingBag,
  Trash2,
} from "lucide-react";
export default function CustomerListingActions({
  listing,
  changeStatusAction,
  deleteAction,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
      >
        <MoreHorizontal size={18} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
          <Link
            href={`/marketplace/${listing.slug}`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            <Eye size={16} />
            Shiko
          </Link>
          <Link
            href={`/customer/listings/${listing.id}/edit`}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            <Edit3 size={16} />
            Ndrysho
          </Link>
          {listing.status !== "PUBLISHED" ? (
            <form action={changeStatusAction}>
              <input type="hidden" name="listingId" value={listing.id} />
              <button
                name="status"
                value="PUBLISHED"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                <Send size={16} />
                Publiko
              </button>
            </form>
          ) : null}
          {listing.status !== "SOLD" ? (
            <form action={changeStatusAction}>
              <input type="hidden" name="listingId" value={listing.id} />
              <button
                name="status"
                value="SOLD"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                <ShoppingBag size={16} />
                Shëno si shitur
              </button>
            </form>
          ) : null}
          {listing.status !== "ARCHIVED" ? (
            <form action={changeStatusAction}>
              <input type="hidden" name="listingId" value={listing.id} />
              <button
                name="status"
                value="ARCHIVED"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold"
              >
                <Archive size={16} />
                Arkivo
              </button>
            </form>
          ) : null}
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!window.confirm("A je i sigurt që dëshiron ta fshish?"))
                e.preventDefault();
            }}
          >
            <input type="hidden" name="listingId" value={listing.id} />
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
              <Trash2 size={16} />
              Fshi
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
