import { requirePlatformAdmin } from "@/lib/auth-guard";

export default async function AdminLayout({ children }) {
  await requirePlatformAdmin();

  return children;
}
