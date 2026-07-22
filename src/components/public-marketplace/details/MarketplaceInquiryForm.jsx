"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  UserRound,
} from "lucide-react";

import { createMarketplaceInquiryAction } from "@/app/marketplace/[slug]/actions";

const initialState = {
  success: false,
  error: null,
  message: null,
};

export default function MarketplaceInquiryForm({
  listingId,
  slug,
  listingTitle,
}) {
  const formRef = useRef(null);

  const [state, formAction, isPending] = useActionState(
    createMarketplaceInquiryAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="mt-8 border-t border-slate-200 pt-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          Kontakto shitësin
        </p>

        <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
          Kërko informacion për këtë publikim
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Plotëso formularin dhe shitësi do të marrë kërkesën tënde për{" "}
          <span className="font-semibold text-slate-700">{listingTitle}</span>.
        </p>
      </div>

      {state.success ? (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
        >
          <CheckCircle2
            size={21}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <p className="text-sm font-bold text-emerald-900">
              Kërkesa u dërgua
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              {state.message}
            </p>
          </div>
        </div>
      ) : null}

      {state.error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.error}
        </div>
      ) : null}

      <form ref={formRef} action={formAction} className="mt-6">
        <input type="hidden" name="listingId" value={listingId} />

        <input type="hidden" name="slug" value={slug} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="inquiry-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Emri dhe mbiemri
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="inquiry-name"
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="P.sh. Arben Hoxha"
                disabled={isPending}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="inquiry-phone"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              a Telefoni
            </label>

            <div className="relative">
              <Phone
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="inquiry-phone"
                type="tel"
                name="phone"
                maxLength={30}
                autoComplete="tel"
                placeholder="+355 69 000 0000"
                disabled={isPending}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="inquiry-email"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              id="inquiry-email"
              type="email"
              name="email"
              maxLength={150}
              autoComplete="email"
              placeholder="emri@email.com"
              disabled={isPending}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Plotëso të paktën telefonin ose email-in.
          </p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="inquiry-message"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Mesazhi
          </label>

          <div className="relative">
            <MessageSquareText
              size={18}
              className="pointer-events-none absolute left-4 top-4 text-slate-400"
            />

            <textarea
              id="inquiry-message"
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              defaultValue={`Përshëndetje, jam i interesuar për publikimin "${listingTitle}". Do të doja më shumë informacion.`}
              disabled={isPending}
              className="w-full resize-y rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm leading-6 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto"
        >
          {isPending ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Duke dërguar...
            </>
          ) : (
            <>
              <Send size={18} />
              Dërgo kërkesën
            </>
          )}
        </button>
      </form>
    </div>
  );
}
