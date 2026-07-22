import {
  Building2,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import MarketplaceInquiryForm from "@/components/public-marketplace/details/MarketplaceInquiryForm";

function normalizeWebsiteUrl(website) {
  if (!website) {
    return "";
  }

  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }

  return `https://${website}`;
}

export default function MarketplaceBusinessCard({ listing }) {
  const business = listing.business;

  const sellerName =
    business?.name || listing.sellerUser?.name || "Shitës privat";

  const phone = listing.phone || business?.phone || listing.sellerUser?.phone;

  const email = listing.email || business?.email || listing.sellerUser?.email;

  const city = listing.city || business?.city;

  const address = listing.address || business?.address;

  const website = normalizeWebsiteUrl(business?.website);

  return (
    <section
      id="kontakti"
      className="scroll-mt-28 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          {business?.logo ? (
            <img
              src={business.logo}
              alt={sellerName}
              className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2 size={28} />
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Informacioni i shitësit
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">
              {sellerName}
            </h2>

            {business?.isActive ? (
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                <ShieldCheck size={16} />
                Biznes aktiv në AutoFlow
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
              <Phone size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Telefoni</p>

              <p className="mt-0.5 text-sm font-bold text-slate-950">{phone}</p>
            </div>
          </a>
        ) : null}

        {email ? (
          <a
            href={`mailto:${email}?subject=${encodeURIComponent(
              `Interes për publikimin: ${listing.title}`,
            )}`}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
              <Mail size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-slate-500">Email</p>

              <p className="mt-0.5 truncate text-sm font-bold text-slate-950">
                {email}
              </p>
            </div>
          </a>
        ) : null}

        {city || address ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
              <MapPin size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Vendndodhja</p>

              <p className="mt-0.5 text-sm font-bold text-slate-950">
                {[address, city].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>
        ) : null}

        {business?.workingHours ? (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-blue-600">
              <Clock3 size={18} />
            </div>

            <div>
              <p className="text-xs text-slate-500">Orari</p>

              <p className="mt-0.5 text-sm font-bold text-slate-950">
                {business.workingHours}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
        >
          <Globe2 size={17} />
          Vizito faqen e biznesit
        </a>
      ) : null}

      <MarketplaceInquiryForm
        listingId={listing.id}
        slug={listing.slug}
        listingTitle={listing.title}
      />
    </section>
  );
}
