export default function BusinessDetailsLoading() {
  return (
    <div className="animate-pulse space-y-7">
      <div className="h-5 w-40 rounded bg-slate-200" />

      <div className="h-44 rounded-[1.75rem] border border-slate-200 bg-white" />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-44 rounded-[1.5rem] border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-96 rounded-[1.75rem] border border-slate-200 bg-white" />
        <div className="h-96 rounded-[1.75rem] border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
