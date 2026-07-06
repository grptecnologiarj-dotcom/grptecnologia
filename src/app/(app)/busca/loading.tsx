import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2"><Skeleton className="h-7 w-36" /><Skeleton className="h-4 w-72" /></div>
      <Skeleton className="h-11 w-full rounded-[var(--radius-md)]" />
      <div className="space-y-3">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-16 w-full rounded-[var(--radius-lg)]"/>)}</div>
    </div>
  );
}
