export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-[var(--color-surface-muted)] animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="h-28 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
        <div className="h-72 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
      </div>
    </div>
  );
}
