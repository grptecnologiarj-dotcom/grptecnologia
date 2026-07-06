export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded bg-[var(--color-surface-muted)] animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1,2,3].map((i) => (
          <div key={i} className="h-24 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
        ))}
      </div>
      <div className="h-96 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
    </div>
  );
}
