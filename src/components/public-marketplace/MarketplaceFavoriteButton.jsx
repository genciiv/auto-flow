"use client";

import { useState, useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";

import { toggleMarketplaceFavorite } from "@/app/customer/favorites/actions";

export default function MarketplaceFavoriteButton({
  listingId,
  initialIsFavorite = false,
  initialFavoritesCount = 0,
  showCount = true,
}) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [favoritesCount, setFavoritesCount] = useState(
    Number(initialFavoritesCount || 0),
  );
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    if (isPending) {
      return;
    }

    setMessage("");

    const previousIsFavorite = isFavorite;
    const previousCount = favoritesCount;

    const nextIsFavorite = !previousIsFavorite;
    const nextCount = Math.max(0, previousCount + (nextIsFavorite ? 1 : -1));

    setIsFavorite(nextIsFavorite);
    setFavoritesCount(nextCount);

    startTransition(async () => {
      const result = await toggleMarketplaceFavorite(listingId);

      if (!result?.success) {
        setIsFavorite(previousIsFavorite);
        setFavoritesCount(previousCount);
        setMessage(result?.message || "Favoriti nuk mund të përditësohej.");
        return;
      }

      setIsFavorite(Boolean(result.isFavorite));

      if (typeof result.favoritesCount === "number") {
        setFavoritesCount(result.favoritesCount);
      }

      setMessage(result.message || "");
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
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-3 shadow-sm backdrop-blur transition ${
          isFavorite
            ? "border-red-200 bg-red-50 text-red-600"
            : "border-white/70 bg-white/95 text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        } disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isPending ? (
          <Loader2 size={19} className="animate-spin" />
        ) : (
          <Heart size={19} fill={isFavorite ? "currentColor" : "none"} />
        )}

        {showCount ? (
          <span className="min-w-3 text-xs font-black">
            {favoritesCount > 999 ? "999+" : favoritesCount}
          </span>
        ) : null}
      </button>

      {message ? (
        <span className="sr-only" role="status">
          {message}
        </span>
      ) : null}
    </div>
  );
}
