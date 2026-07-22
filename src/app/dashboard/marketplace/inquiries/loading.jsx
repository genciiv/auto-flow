import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function MarketplaceInquiriesLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />

          <div className="mt-5 h-9 w-56 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-5 w-full max-w-xl animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-[1.5rem] bg-white"
            />
          ))}
        </div>

        <div className="h-20 animate-pulse rounded-[1.5rem] bg-white" />

        <div className="h-[420px] animate-pulse rounded-[1.5rem] bg-white" />
      </div>
    </DashboardLayout>
  );
}
