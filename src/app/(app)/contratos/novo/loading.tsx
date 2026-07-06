import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Skeleton className="h-4 w-32" />
      <div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-80" /></div>
      <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
  );
}
