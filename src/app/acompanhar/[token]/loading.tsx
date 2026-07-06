export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-10">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] animate-pulse" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-[var(--color-surface-muted)] animate-pulse" />
              <div className="h-3 w-20 rounded bg-[var(--color-surface-muted)] animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] animate-pulse" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-5 px-4 py-6">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center space-y-3">
          <div className="mx-auto h-7 w-32 rounded-full bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="mx-auto h-8 w-28 rounded bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="mx-auto h-4 w-48 rounded bg-[var(--color-surface-muted)] animate-pulse" />
          <div className="h-2 w-full rounded-full bg-[var(--color-surface-muted)] animate-pulse mt-4" />
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-6">
          <div className="h-5 w-40 rounded bg-[var(--color-surface-muted)] animate-pulse" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 pl-10 relative">
              <div className="absolute left-0 size-9 rounded-full bg-[var(--color-surface-muted)] animate-pulse" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 w-36 rounded bg-[var(--color-surface-muted)] animate-pulse" />
                <div className="h-3 w-52 rounded bg-[var(--color-surface-muted)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-3">
          <div className="h-5 w-40 rounded bg-[var(--color-surface-muted)] animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between pt-2">
              <div className="h-4 w-32 rounded bg-[var(--color-surface-muted)] animate-pulse" />
              <div className="h-4 w-24 rounded bg-[var(--color-surface-muted)] animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
