import Link from "next/link";

const STATUS_LABELS = {
  TRIALING: "Provë aktive",
  ACTIVE: "Aktiv",
  PAST_DUE: "Pagesë e vonuar",
  CANCELLED: "Anuluar",
  EXPIRED: "Skaduar",
};

function formatMoney(value, currency = "ALL") {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getRemainingDays(value) {
  if (!value) {
    return null;
  }

  const milliseconds = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(milliseconds / 86_400_000));
}

export default function SettingsBilling({
  subscription,
  currency = "ALL",
  canManage = false,
}) {
  if (!subscription?.plan) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Abonimi</h2>
        <p className="mt-1 text-sm text-slate-500">
          Plani aktual dhe informacioni i pagesës.
        </p>

        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-bold text-amber-900">Pa abonim aktiv</p>
          <p className="mt-2 text-sm leading-6 text-amber-700">
            Ky biznes nuk ka ende një plan të lidhur. Kontakto administratorin
            për aktivizim.
          </p>

          {canManage ? (
            <Link
              href="/dashboard/settings/subscription"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Shiko planet
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const isTrial = subscription.status === "TRIALING";
  const intervalLabel =
    subscription.billingInterval === "YEARLY" ? "vit" : "muaj";
  const configuredPrice =
    subscription.billingInterval === "YEARLY"
      ? subscription.plan.yearlyPrice
      : subscription.plan.monthlyPrice;
  const displayedPrice =
    Number(subscription.price) > 0 ? subscription.price : configuredPrice;
  const periodEnd = isTrial
    ? subscription.trialEndsAt
    : subscription.currentPeriodEnd;
  const remainingDays = getRemainingDays(periodEnd);

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Abonimi</h2>
      <p className="mt-1 text-sm text-slate-500">
        Plani aktual dhe informacioni i pagesës.
      </p>

      <div className="mt-6 rounded-3xl bg-blue-600 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-100">Plani aktual</p>
            <h3 className="mt-2 text-3xl font-bold">{subscription.plan.name}</h3>
          </div>

          <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white">
            {STATUS_LABELS[subscription.status] || subscription.status}
          </span>
        </div>

        <p className="mt-3 text-lg font-semibold text-blue-50">
          {isTrial
            ? "Falas gjatë periudhës së provës"
            : `${formatMoney(displayedPrice, currency)} / ${intervalLabel}`}
        </p>

        <div className="mt-5 grid gap-3 text-sm text-blue-50 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              {isTrial ? "Trial përfundon" : "Periudha përfundon"}
            </p>
            <p className="mt-1 font-bold">{formatDate(periodEnd)}</p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">
              Kohë e mbetur
            </p>
            <p className="mt-1 font-bold">
              {remainingDays == null ? "—" : `${remainingDays} ditë`}
            </p>
          </div>
        </div>

        {canManage ? (
          <Link
            href="/dashboard/settings/subscription"
            className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
          >
            Ndrysho planin
          </Link>
        ) : (
          <p className="mt-5 text-xs leading-5 text-blue-100">
            Vetëm pronari i biznesit mund të menaxhojë abonimin.
          </p>
        )}
      </div>
    </div>
  );
}
