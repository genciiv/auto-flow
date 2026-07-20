import { requireBusinessUser } from "@/lib/auth-guard";

export default async function DashboardLayout({ children }) {
  const currentUser = await requireBusinessUser();

  return <>{children}</>;
}
