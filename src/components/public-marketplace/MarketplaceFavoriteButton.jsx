"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";

import { toggleMarketplaceFavorite } from "@/app/customer/favorites/actions";

export default function MarketplaceFavoriteButton({
  listingId,
  initialIsFavorite = false,
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleToggle(event) {
    event.preventDefault();
    event.stopPropagation();
    setMessage("");

    startTransition(async () => {
      const result = await toggleMarketplaceFavorite(listingId);

      if (result?.success) {
        setIsFavorite(Boolean(result.isFavorite));
      }

      setMessage(result?.message || "Veprimi nuk mund të përfundohej.");
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isFavorite ? "Hiqe nga favoritet" : "Shtoje te favoritet"}
        title={isFavorite ? "Hiqe nga favoritet" : "Shtoje te favoritet"}
        className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm backdrop-blur transition ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-white/70 bg-white/95 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {isPending ? (
          <Loader2 size={19} className="animate-spin" />
        ) : (
          <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
        )}
      </button>

      {message ? (
        <span className="sr-only" role="status">
          {message}
        </span>
      ) : null}
    </div>
  );
}
