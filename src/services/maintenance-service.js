import { getPlatformSettings } from "@/services/admin/settings-service";

export async function getMaintenanceStatus() {
  const settings = await getPlatformSettings();

  return {
    maintenanceMode: settings.maintenanceMode,
    platformName: settings.platformName || "AutoFlow",
    supportEmail: settings.supportEmail || "vaqogenci@gmail.com",
    supportPhone: settings.supportPhone || null,
  };
}
