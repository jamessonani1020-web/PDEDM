import { Skeleton } from "@/components/ui/skeleton";

export default function EphemerisLoading() {
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <Skeleton className="h-4 w-32" />
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="border border-border p-5 rounded-md space-y-4 bg-card">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
