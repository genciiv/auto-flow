import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SettingsProfile from "@/components/settings/SettingsProfile";
import SettingsBusiness from "@/components/settings/SettingsBusiness";
import SettingsNotifications from "@/components/settings/SettingsNotifications";
import SettingsBilling from "@/components/settings/SettingsBilling";

export default function SettingsPage() {
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

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SettingsProfile />
          <SettingsBusiness />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SettingsNotifications />
          <SettingsBilling />
        </div>
      </div>
    </DashboardLayout>
  );
}
