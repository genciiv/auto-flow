import Link from "next/link";
import { AlertTriangle, Clock3, CreditCard, ShieldAlert } from "lucide-react";

import SubscriptionLogoutButton from "@/components/subscription/SubscriptionLogoutButton";

import { requireUser } from "@/lib/auth-guard";

function getReasonContent(reason) {
  const content = {
    NO_SUBSCRIPTION: {
      title: "Nuk ka abonim aktiv",
      description:
        "Biznesi nuk ka ende një trial ose abonim aktiv. Kontakto administratorin për të aktivizuar një plan.",
      icon: CreditCard,
    },

    TRIAL_EXPIRED: {
      title: "Periudha e provës ka përfunduar",
      description:
        "Trial-i falas ka skaduar. Për të vazhduar përdorimin e AutoFlow duhet të aktivizohet një plan me pagesë.",
      icon: Clock3,
    },

    SUBSCRIPTION_EXPIRED: {
      title: "Abonimi ka skaduar",
      description:
        "Periudha e abonimit ka përfunduar. Rinovo abonimin për të rikthyer aksesin në dashboard.",
      icon: ShieldAlert,
    },

    PAST_DUE: {
      title: "Pagesa është e vonuar",
      description:
        "Abonimi është në pritje të pagesës. Aksesi do të rikthehet pasi pagesa të konfirmohet.",
      icon: AlertTriangle,
    },

    CANCELLED: {
      title: "Abonimi është anuluar",
      description:
        "Abonimi i biznesit është anuluar. Kontakto administratorin për të aktivizuar një plan të ri.",
      icon: ShieldAlert,
    },
  };

  return (
    content[reason] || {
      title: "Aksesi në platformë është pezulluar",
      description:
        "Biznesi nuk ka një abonim aktiv për të përdorur dashboard-in.",
      icon: ShieldAlert,
    }
  );
}

export default async function SubscriptionRequiredPage({ searchParams }) {
  await requireUser();

  const resolvedSearchParams = await searchParams;
  const reason = resolvedSearchParams?.reason || "INACTIVE";

  const content = getReasonContent(reason);
  const Icon = content.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Icon size={30} />
        </div>

        <p className="mt-6 text-sm font-semibold text-blue-600">AutoFlow</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          {content.title}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
          {content.description}
        </p>

        <div className="mt-7 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-left">
          <p className="text-sm font-semibold text-amber-900">
            Çfarë duhet të bësh?
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Kontakto administratorin e platformës për aktivizimin, rinovimin ose
            konfirmimin e pagesës së abonimit.
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="mailto:vaqogenci@gmail.com"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CreditCard size={17} />
            Kontakto administratorin
          </Link>

          <SubscriptionLogoutButton />
        </div>
      </section>
    </main>
  );
}
