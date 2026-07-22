import CustomerLayout from "@/components/customer/CustomerLayout";
import { requireCustomerContext } from "@/lib/customer-context";

export default async function CustomerPortalLayout({ children }) {
  const { user } = await requireCustomerContext();

  return (
    <CustomerLayout
      userName={user.name}
      userEmail={user.email}
      favoriteCount={user._count?.marketplaceFavorites ?? 0}
    >
      {children}
    </CustomerLayout>
  );
}
