"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ExternalLink,
  Mail,
  MailOpen,
  MessageSquareText,
  Phone,
  UserRound,
  X,
} from "lucide-react";

import {
  markMarketplaceInquiryAsReadAction,
  markMarketplaceInquiryAsUnreadAction,
} from "@/app/dashboard/marketplace/inquiries/actions";

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getTypeLabel(type) {
  const labels = {
    VEHICLE: "Makinë",
    MOTORCYCLE: "Motor",
    PART: "Pjesë",
    ACCESSORY: "Aksesor",
    SERVICE: "Shërbim",
    OTHER: "Tjetër",
  };

  return labels[type] || "Publikim";
}

function InquiryDetails({ inquiry, canManage, onClose, onStatusChange }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  async function changeStatus() {
    if (!canManage || isUpdating) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    const action = inquiry.isRead
      ? markMarketplaceInquiryAsUnreadAction
      : markMarketplaceInquiryAsReadAction;

    const result = await action(inquiry.id);

    if (!result.success) {
      setError(result.error);
      setIsUpdating(false);
      return;
    }

    onStatusChange();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Mbyll panelin"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
              Kërkesa e Marketplace
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Detajet e kërkesës
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-start gap-4">
              {inquiry.listing.images?.[0]?.url ? (
                <img
                  src={inquiry.listing.images[0].url}
                  alt={inquiry.listing.title}
                  className="h-20 w-24 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400">
                  <MessageSquareText size={24} />
                </div>
              )}

              <div className="min-w-0">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  {getTypeLabel(inquiry.listing.type)}
                </span>

                <h3 className="mt-2 font-bold text-slate-950">
                  {inquiry.listing.title}
                </h3>

                <Link
                  href={`/marketplace/${inquiry.listing.slug}`}
                  target="_blank"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Hap publikimin
                  <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
              Kontakti
            </h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <UserRound size={18} className="text-blue-600" />

                <div>
                  <p className="text-xs text-slate-500">Emri</p>

                  <p className="mt-0.5 text-sm font-bold text-slate-950">
                    {inquiry.name}
                  </p>
                </div>
              </div>

              {inquiry.phone ? (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <Phone size={18} className="text-blue-600" />

                  <div>
                    <p className="text-xs text-slate-500">Telefoni</p>

                    <p className="mt-0.5 text-sm font-bold text-slate-950">
                      {inquiry.phone}
                    </p>
                  </div>
                </a>
              ) : null}

              {inquiry.email ? (
                <a
                  href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                    `Përgjigje për publikimin: ${inquiry.listing.title}`,
                  )}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
                >
                  <Mail size={18} className="text-blue-600" />

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">Email</p>

                    <p className="mt-0.5 truncate text-sm font-bold text-slate-950">
                      {inquiry.email}
                    </p>
                  </div>
                </a>
              ) : null}

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <CalendarDays size={18} className="text-blue-600" />

                <div>
                  <p className="text-xs text-slate-500">Data</p>

                  <p className="mt-0.5 text-sm font-bold text-slate-950">
                    {formatDate(inquiry.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-400">
              Mesazhi
            </h3>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                {inquiry.message}
              </p>
            </div>
          </section>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {canManage ? (
            <button
              type="button"
              onClick={changeStatus}
              disabled={isUpdating}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {inquiry.isRead ? (
                <>
                  <MailOpen size={18} />
                  Shëno si të palexuar
                </>
              ) : (
                <>
                  <Check size={18} />
                  Shëno si të lexuar
                </>
              )}
            </button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export default function InquiryTable({ inquiries = [], canManage = false }) {
  const router = useRouter();

  const [selectedInquiry, setSelectedInquiry] = useState(null);

  function handleStatusChange() {
    setSelectedInquiry(null);

    startTransition(() => {
      router.refresh();
    });
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <MessageSquareText size={25} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          Nuk ka kërkesa
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          Nuk u gjet asnjë kërkesë që përputhet me filtrat e zgjedhur.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200 text-left">
                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Publikimi
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kontakti
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Mesazhi
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Data
                </th>

                <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Statusi
                </th>

                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                  Veprime
                </th>
              </tr>
            </thead>

            <tbody>
              {inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  className={`border-b border-slate-100 last:border-b-0 ${
                    inquiry.isRead ? "bg-white" : "bg-blue-50/40"
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {inquiry.listing.images?.[0]?.url ? (
                        <img
                          src={inquiry.listing.images[0].url}
                          alt={inquiry.listing.title}
                          className="h-12 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                          <MessageSquareText size={18} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="max-w-48 truncate text-sm font-bold text-slate-950">
                          {inquiry.listing.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {getTypeLabel(inquiry.listing.type)}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-950">
                      {inquiry.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {inquiry.phone || inquiry.email || "Pa kontakt"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-64 truncate text-sm text-slate-600">
                      {inquiry.message}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                    {formatDate(inquiry.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        inquiry.isRead
                          ? "bg-slate-100 text-slate-600"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {inquiry.isRead ? "E lexuar" : "E palexuar"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(inquiry)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Hap
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInquiry ? (
        <InquiryDetails
          inquiry={selectedInquiry}
          canManage={canManage}
          onClose={() => setSelectedInquiry(null)}
          onStatusChange={handleStatusChange}
        />
      ) : null}
    </>
  );
}
