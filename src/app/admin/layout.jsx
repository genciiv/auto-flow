import AdminLayout from "@/components/admin/AdminLayout";
import { requirePlatformAdmin } from "@/lib/auth-guard";

export default async function PlatformAdminLayout({ children }) {
  const user = await requirePlatformAdmin();

  return <AdminLayout user={user}>{children}</AdminLayout>;
}
