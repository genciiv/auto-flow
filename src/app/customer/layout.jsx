import { redirect } from "next/navigation";

import CustomerLayout from "@/components/customer/CustomerLayout";
import { requireCustomerContext } from "@/lib/customer-context";
import { getMaintenanceStatus } from "@/services/maintenance-service";

export default async function CustomerPortalLayout({ children }) {
  const maintenance = await getMaintenanceStatus();

  if (maintenance.maintenanceMode) {
    redirect("/maintenance");
  }

  const { user } = await requireCustomerContext();

  return (
    <CustomerLayout
      userName={user.name}
      userEmail={user.email}
    >
      {children}
    </CustomerLayout>
  );
}
