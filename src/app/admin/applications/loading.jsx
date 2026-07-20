export default function ApplicationsLoading() {
  return (
    <div className="animate-pulse space-y-7">
      <div>
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-4 h-9 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[1.5rem] border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="h-24 rounded-[1.75rem] border border-slate-200 bg-white" />

      <div className="h-[500px] rounded-[1.75rem] border border-slate-200 bg-white" />
    </div>
  );
}
