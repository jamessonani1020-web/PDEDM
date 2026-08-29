import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Skeleton className="h-4 w-32" />
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </div>
      <div className="border border-border p-5 rounded-md space-y-6 bg-card">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-72" />
          </div>
        ))}
      </div>
    </div>
  );
}
