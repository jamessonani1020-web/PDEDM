import { Skeleton } from "@/components/ui/skeleton";

export default function BriefingLoading() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-24">
      <Skeleton className="h-4 w-32" />
      <div>
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="border border-border p-6 rounded-md space-y-3 bg-card">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border p-5 rounded-md space-y-3 bg-card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
