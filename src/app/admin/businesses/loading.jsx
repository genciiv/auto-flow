export default function BusinessesLoading() {
  return (
    <div className="animate-pulse space-y-7">
      <div>
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-4 h-9 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
      </div>

      <div className="h-24 rounded-[1.75rem] border border-slate-200 bg-white" />

      <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
        <div className="h-14 border-b border-slate-100 bg-slate-50" />

        <div className="space-y-1 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-20 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
