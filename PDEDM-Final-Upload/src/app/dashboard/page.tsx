"use client";

import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Crosshair,
  Gauge,
  Hash,
  RefreshCw,
  Rocket,
  ShieldAlert,
  Calendar,
} from "lucide-react";

import { DataTable } from "@/components/table/DataTable";
import { neoColumns } from "@/components/table/columns";
import { VelocityCurve } from "@/components/charts/VelocityCurve";
import { EphemerisPanel } from "@/components/panels/EphemerisPanel";

import { useNeoFeed } from "@/hooks/useNeoData";
import { useDateRange } from "@/hooks/useDateRange";
import { useSelectionStore } from "@/stores/selection-store";
import { useRateLimitStore } from "@/stores/rate-limit-store";
import type { NeoTableRow } from "@/types/schema";

export default function DashboardPage() {
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    validationError,
    isValid,
  } = useDateRange();

  const { data, isLoading, isError, error, refetch, isFetching } =
    useNeoFeed(startDate, endDate);

  const { setSelected } = useSelectionStore();
  const { remaining, limit } = useRateLimitStore();

  // ---------------------------------------------------------------------------
  // Computed stats
  // ---------------------------------------------------------------------------
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        totalCount: 0,
        hazardousCount: 0,
        closestApproach: null as NeoTableRow | null,
        fastestObject: null as NeoTableRow | null,
      };
    }

    const hazardousCount = data.filter((r) => r.isHazardous).length;

    const closestApproach = data.reduce<NeoTableRow | null>((prev, curr) => {
      if (!prev) return curr;
      return curr.missDistanceKm < prev.missDistanceKm ? curr : prev;
    }, null);

    const fastestObject = data.reduce<NeoTableRow | null>((prev, curr) => {
      if (!prev) return curr;
      return curr.velocityKmPerSec > prev.velocityKmPerSec ? curr : prev;
    }, null);

    return {
      totalCount: data.length,
      hazardousCount,
      closestApproach,
      fastestObject,
    };
  }, [data]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  function handleRowClick(row: NeoTableRow) {
    setSelected(row.id, row.name);
  }

  function isRowHighlighted(row: NeoTableRow): boolean {
    return row.isHazardous;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="p-6 space-y-6">
      {/* Top bar: breadcrumbs + status */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">
                NEO Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-3">
          {remaining !== null && limit !== null && (
            <Badge
              variant="outline"
              className="border-slate-700 text-muted-foreground text-xs tabular-nums"
            >
              API: {remaining}/{limit}
            </Badge>
          )}
          {isFetching && (
            <Badge
              variant="outline"
              className="border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-600 dark:text-blue-400 text-xs animate-pulse"
            >
              Fetching…
            </Badge>
          )}
        </div>
      </div>

      {/* Controls: Date range */}
      <Card>
        <CardContent className="py-4 px-5">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-44 bg-white/5 border-white/10 text-foreground h-9 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-44 bg-white/5 border-white/10 text-foreground h-9 text-sm"
              />
            </div>
            <Button
              onClick={() => refetch()}
              disabled={!isValid || isFetching}
              className="bg-blue-600 hover:bg-blue-700 text-foreground h-9 px-5"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
              />
              Fetch Data
            </Button>
            {validationError && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {validationError}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total NEOs"
          value={isLoading ? null : stats.totalCount.toString()}
          icon={<Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          subtitle={`${startDate} → ${endDate}`}
        />
        <StatCard
          title="Hazardous"
          value={isLoading ? null : stats.hazardousCount.toString()}
          icon={<ShieldAlert className="h-4 w-4 text-red-400" />}
          subtitle="Potentially hazardous asteroids"
          highlight={stats.hazardousCount > 0}
        />
        <StatCard
          title="Closest Approach"
          value={
            isLoading || !stats.closestApproach
              ? null
              : `${stats.closestApproach.missDistanceKm.toLocaleString("en-US", { maximumFractionDigits: 0 })} km`
          }
          icon={<Crosshair className="h-4 w-4 text-amber-400" />}
          subtitle={stats.closestApproach?.name ?? "—"}
        />
        <StatCard
          title="Fastest Object"
          value={
            isLoading || !stats.fastestObject
              ? null
              : `${stats.fastestObject.velocityKmPerSec.toFixed(2)} km/s`
          }
          icon={<Gauge className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          subtitle={stats.fastestObject?.name ?? "—"}
        />
      </div>

      {/* Error state */}
      {isError && (
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  Data Fetch Failed
                </p>
                <p className="text-red-300/60 text-xs mt-0.5">
                  {error?.message ?? "Unknown error occurred"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-auto border-red-800 text-red-400 hover:bg-red-950/40"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content grid: Table + Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Data Table — 2/3 width */}
        <div className="xl:col-span-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3 pt-4 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <Rocket className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Near Earth Objects
                </CardTitle>
                <Badge
                  variant="outline"
                  className="border-slate-700 text-muted-foreground text-xs"
                >
                  {data.length} objects
                </Badge>
              </div>
            </CardHeader>
            <Separator className="bg-white/10" />
            <CardContent className="pt-4 px-5 pb-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-9 w-full bg-slate-800" />
                  <Skeleton className="h-[400px] w-full bg-slate-800" />
                </div>
              ) : (
                <DataTable
                  columns={neoColumns}
                  data={data}
                  onRowClick={handleRowClick}
                  isRowHighlighted={isRowHighlighted}
                  exportFilename="neo_objects"
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Velocity Chart — 1/3 width */}
        <div className="xl:col-span-1">
          <Card className="bg-white/5 border-white/10 h-full">
            <CardHeader className="pb-3 pt-4 px-5">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Velocity Distribution
              </CardTitle>
            </CardHeader>
            <Separator className="bg-white/10" />
            <CardContent className="pt-4 px-5 pb-5">
              {isLoading ? (
                <Skeleton className="h-[350px] w-full bg-slate-800" />
              ) : (
                <div className="h-[350px]">
                  <VelocityCurve data={data} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ephemeris side panel (Sheet) */}
      <EphemerisPanel />
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string;
  value: string | null;
  icon: React.ReactNode;
  subtitle: string;
  highlight?: boolean;
}

function StatCard({ title, value, icon, subtitle, highlight }: StatCardProps) {
  return (
    <Card
      className={`glass-card ${
        highlight ? "bg-amber-950/20 border-amber-900/50" : ""
      }`}
    >
      <CardContent className="py-4 px-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {title}
          </span>
          {icon}
        </div>
        {value !== null ? (
          <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
        ) : (
          <Skeleton className="h-8 w-24 bg-slate-800" />
        )}
        <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
