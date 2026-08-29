import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-[350px]" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border p-4 rounded-md space-y-3 bg-card">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Charts & Tables */}
      <div className="flex flex-col gap-6">
        <div className="border border-border p-5 rounded-md space-y-4 bg-card">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="border border-border p-5 rounded-md space-y-4 bg-card">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    </div>
  );
}
