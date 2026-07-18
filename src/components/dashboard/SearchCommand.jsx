"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  FileSearch,
  FileText,
  Loader2,
  Package,
  Search,
  Users,
  Wrench,
  X,
} from "lucide-react";

import { formatCurrency } from "@/lib/formatters";

const categoryConfig = {
  customer: {
    icon: Users,
    className: "bg-blue-50 text-blue-600",
  },
  vehicle: {
    icon: Car,
    className: "bg-violet-50 text-violet-600",
  },
  invoice: {
    icon: FileText,
    className: "bg-emerald-50 text-emerald-600",
  },
  service: {
    icon: Wrench,
    className: "bg-amber-50 text-amber-600",
  },
  part: {
    icon: Package,
    className: "bg-cyan-50 text-cyan-600",
  },
};

export default function SearchCommand() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedQuery = query.trim();

  const groupedResults = useMemo(() => {
    return results.reduce((groups, item) => {
      const category = item.category || "other";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);

      return groups;
    }, {});
  }, [results]);

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setError("");
    setIsLoading(false);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(focusTimeout);
    };
  }, [open]);

  useEffect(() => {
    if (!open || normalizedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();

    const searchTimeout = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(normalizedQuery)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.message || "Kërkimi nuk mund të përfundohej.");
        }

        setResults(Array.isArray(data.results) ? data.results : []);
      } catch (searchError) {
        if (searchError.name === "AbortError") {
          return;
        }

        console.error("Search request error:", searchError);

        setResults([]);
        setError(searchError.message || "Ndodhi një gabim gjatë kërkimit.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(searchTimeout);
    };
  }, [normalizedQuery, open]);

  function handleQueryChange(event) {
    const value = event.target.value;

    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setError("");
      setIsLoading(false);
    }
  }

  function handleClearQuery() {
    setQuery("");
    setResults([]);
    setError("");
    setIsLoading(false);
    inputRef.current?.focus();
  }

  function handleResultClick(item) {
    closeSearch();
    router.push(item.href);
  }

  function getResultSubtitle(item) {
    const details = [];

    if (item.amount !== undefined && item.amount !== null) {
      details.push(formatCurrency(item.amount));
    }

    if (item.subtitle) {
      details.push(item.subtitle);
    }

    return details.join(" • ");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden w-full max-w-md items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white lg:flex"
      >
        <span className="flex items-center gap-3">
          <Search size={18} className="text-slate-400" />
          Kërko klient, automjet, faturë...
        </span>

        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-bold text-slate-400">
          Ctrl K
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl sm:mt-24">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
              {isLoading ? (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-blue-600" />
              ) : (
                <Search className="h-5 w-5 shrink-0 text-slate-400" />
              )}

              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="Kërko në AutoFlow..."
                className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClearQuery}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  Pastro
                </button>
              )}

              <button
                type="button"
                onClick={closeSearch}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Mbyll kërkimin"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-3">
              {normalizedQuery.length < 2 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Search className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    Kërko në të gjithë AutoFlow
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Shkruaj të paktën dy karaktere për të kërkuar klientë,
                    automjete, fatura, shërbime dhe pjesë.
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex items-center justify-center gap-3 px-6 py-14 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  Duke kërkuar...
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  {error}
                </div>
              ) : results.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <FileSearch className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-slate-900">
                    Nuk u gjet asnjë rezultat
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Provo një emër, targë, numër fature ose emër pjese tjetër.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupedResults).map(
                    ([category, categoryResults]) => {
                      const config =
                        categoryConfig[category] || categoryConfig.customer;

                      const Icon = config.icon;

                      return (
                        <div key={category}>
                          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {categoryResults[0]?.type}
                          </p>

                          <div className="space-y-1">
                            {categoryResults.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleResultClick(item)}
                                className="flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:bg-slate-50"
                              >
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.className}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-bold text-slate-950">
                                    {item.title}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {getResultSubtitle(item)}
                                  </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                                  {item.type}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-400">
              <span>
                {results.length > 0
                  ? `${results.length} rezultate`
                  : "Kërkim global"}
              </span>

              <span>ESC për ta mbyllur</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
