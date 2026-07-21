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

  const [profile, business] = await Promise.all([
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
  ]);

  const canUpdateSettings = hasPermission(
    businessRole,
    PERMISSIONS.SETTINGS_UPDATE,
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold text-blue-600">Cilësimet</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Cilësimet e llogarisë
          </h1>

          <p className="mt-2 text-slate-500">
            Menaxho profilin, biznesin, njoftimet dhe abonimin.
          </p>
        </div>

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
          <SettingsBilling />
        </div>
      </div>
    </DashboardLayout>
  );
}
