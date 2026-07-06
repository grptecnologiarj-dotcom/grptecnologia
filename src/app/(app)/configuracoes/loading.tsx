export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded bg-[var(--color-surface-muted)] animate-pulse" />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <div className="h-64 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
        <div className="space-y-4">
          {[1,2,3].map((i) => (
            <div key={i} className="h-32 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
