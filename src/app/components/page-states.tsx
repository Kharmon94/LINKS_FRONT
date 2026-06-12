import { Skeleton } from './ui/skeleton';

export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-3">
      <Skeleton className="h-9 w-48 mx-auto" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  );
}

export function CardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function StatsRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${count} gap-4 mb-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}
