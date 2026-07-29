"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Braces, Info, X } from "lucide-react";

function stringifyJson(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function JsonBlock({ title, value, icon: Icon }) {
  const formattedValue = stringifyJson(value);

  if (!formattedValue) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Icon size={15} />
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
          {title}
        </p>
      </div>

      <pre
        dir="ltr"
        className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words p-4 text-left font-mono text-xs leading-6 text-slate-700"
      >
        {formattedValue}
      </pre>
    </section>
  );
}

export default function ActivityLogDetailsButton({ log }) {
  const [open, setOpen] = useState(false);

  const hasDetails =
    Boolean(log.oldValues) || Boolean(log.newValues) || Boolean(log.metadata);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!hasDetails) {
    return <span className="text-xs text-slate-400">Pa detaje</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        Shiko detajet
        <ArrowRight size={14} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`activity-log-title-${log.id}`}
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/20"
          >
            <header className="flex items-start justify-between gap-5 border-b border-slate-200 px-6 py-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Detajet e aktivitetit
                </p>

                <h2
                  id={`activity-log-title-${log.id}`}
                  className="mt-2 text-xl font-bold text-slate-950"
                >
                  {log.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {log.description ||
                    "Nuk ka përshkrim shtesë për këtë aktivitet."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Mbyll detajet"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </header>

            <div className="overflow-y-auto px-6 py-5">
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Moduli
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {log.entityType}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Entity ID
                  </p>

                  <p
                    dir="ltr"
                    className="mt-2 break-all text-left font-mono text-xs font-semibold text-slate-700"
                  >
                    {log.entityId || "Pa ID"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <JsonBlock
                  title="Vlerat e mëparshme"
                  value={log.oldValues}
                  icon={Braces}
                />

                <JsonBlock
                  title="Vlerat e reja"
                  value={log.newValues}
                  icon={Braces}
                />

                {log.metadata ? (
                  <div className="lg:col-span-2">
                    <JsonBlock
                      title="Metadata"
                      value={log.metadata}
                      icon={Info}
                    />
                  </div>
                ) : null}
              </div>
            </div>

            <footer className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Mbyll
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}
