import { Download, Settings2, ShieldCheck } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsProfile from "@/components/settings/SettingsProfile";
import SettingsBusiness from "@/components/settings/SettingsBusiness";
import SettingsNotifications from "@/components/settings/SettingsNotifications";
import SettingsBilling from "@/components/settings/SettingsBilling";

import { db } from "@/lib/db";
import { PERMISSIONS, hasPermission } from "@/lib/permissions";
import { requireBusinessPermission } from "@/lib/business-context";

export default async function SettingsPage() {
  const { userId, businessId, businessRole } = await requireBusinessPermission(
    PERMISSIONS.SETTINGS_VIEW,
  );

  const [profile, business, subscription] = await Promise.all([
    db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
      },
    }),

    db.business.findFirst({
      where: {
        id: businessId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        nipt: true,
        city: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        logo: true,
        workingHours: true,
        currency: true,
        vat: true,
        timezone: true,
        isActive: true,
      },
    }),

    db.subscription.findFirst({
      where: {
        businessId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        billingInterval: true,
        price: true,
        trialStartsAt: true,
        trialEndsAt: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            monthlyPrice: true,
            yearlyPrice: true,
          },
        },
      },
    }),
  ]);

  const canUpdateSettings = hasPermission(
    businessRole,
    PERMISSIONS.SETTINGS_UPDATE,
  );

  const canManageBilling = hasPermission(
    businessRole,
    PERMISSIONS.BILLING_MANAGE,
  );

  return (
    <DashboardLayout>
      <div className="space-y-7">
        <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                <Settings2 size={14} />
                Konfigurimi i biznesit
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Cilësimet e llogarisë
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Menaxho profilin, biznesin, njoftimet dhe abonimin.
              </p>
            </div>
            <ShieldCheck className="hidden text-blue-300 sm:block" size={38} />
          </div>
        </section>

        {!canUpdateSettings && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="text-sm font-semibold text-amber-900">
              Ke akses vetëm për lexim
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              Mund t&apos;i shikosh të dhënat, por vetëm pronari i biznesit mund
              t&apos;i ndryshojë ato.
            </p>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <SettingsProfile profile={profile} canUpdate={canUpdateSettings} />

          <SettingsBusiness business={business} canUpdate={canUpdateSettings} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SettingsNotifications canUpdate={canUpdateSettings} />
          <SettingsBilling
            subscription={subscription}
            currency={business?.currency || "ALL"}
            canManage={canManageBilling}
          />
        </div>

        {canUpdateSettings && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Download size={20} />
            </div>
            <p className="mt-5 text-sm font-semibold text-blue-600">Privatësia</p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Eksporto të dhënat e biznesit</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Shkarko një kopje JSON të të dhënave operative të biznesit. Eksporti është i kufizuar sipas biznesit aktiv dhe regjistrohet në Audit Log.
            </p>
            <a
              href="/api/dashboard/privacy/export"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Download size={16} />
              Shkarko eksportin JSON
            </a>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
