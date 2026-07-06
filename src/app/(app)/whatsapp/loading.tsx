export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 rounded bg-[var(--color-surface-muted)] animate-pulse" />
      <div className="h-80 rounded-[var(--radius-lg)] bg-[var(--color-surface-muted)] animate-pulse" />
    </div>
  );
}
