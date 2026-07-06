export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-52 rounded bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="h-4 w-80 rounded bg-[var(--color-surface-muted)] animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] animate-pulse" />
      </div>
      <div className="h-10 max-w-xl rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] animate-pulse" />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-4">
          <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="h-40 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
