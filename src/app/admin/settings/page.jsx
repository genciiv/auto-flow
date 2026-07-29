import { Settings } from "lucide-react";

import SettingsForm from "@/components/admin/settings/SettingsForm";
import { getPlatformSettings } from "@/services/admin/settings-service";

export default async function SettingsPage() {
  const settings = await getPlatformSettings();

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Platform Admin</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Settings
          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">
            Menaxho konfigurimet kryesore, trial-in, pagesat dhe aksesin në
            platformën AutoFlow.
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Settings size={23} />
        </div>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
