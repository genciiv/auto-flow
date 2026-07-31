export default function Skeleton({ className = "" }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} />;
}

export function PageSkeleton() {
  return <div className="space-y-6 p-6" aria-label="Duke ngarkuar"><div className="space-y-3"><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div><div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-80 w-full" /></div>;
}
