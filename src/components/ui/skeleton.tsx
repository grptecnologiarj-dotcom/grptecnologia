import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-muted)]",
        className
      )}
      style={style}
    />
  );
}

export function SkeletonLine({ width = "100%", className }: { width?: string; className?: string }) {
  return <Skeleton className={cn("h-4", className)} style={{ width }} />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm space-y-3", className)}>
      <SkeletonLine width="40%" className="h-3" />
      <SkeletonLine width="70%" className="h-6" />
      <SkeletonLine width="55%" className="h-3" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  const widths = ["30%", "45%", "20%", "15%", "25%", "35%"];
  return (
    <tr className="border-b border-[var(--color-border)]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4" style={{ width: widths[i % widths.length] }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonListPage({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-[var(--radius-md)]" />
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-5 py-4 flex gap-3">
          <Skeleton className="h-9 flex-1 rounded-[var(--radius-md)]" />
          <Skeleton className="h-9 w-32 rounded-[var(--radius-md)]" />
        </div>
        <table className="w-full">
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonTableRow key={i} cols={cols} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
