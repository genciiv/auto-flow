import { requireBusinessUser } from "@/lib/auth-guard";

export default async function DashboardLayout({ children }) {
  await requireBusinessUser();

  return <>{children}</>;
}
