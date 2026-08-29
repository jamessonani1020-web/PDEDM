"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle, Crosshair, Gauge, Hash, RefreshCw, Rocket, ShieldAlert, Calendar
} from "lucide-react";

import { DataTable } from "@/components/table/DataTable";
import { neoColumns } from "@/components/table/columns";
import { VelocityCurve } from "@/components/charts/VelocityCurve";
import { EphemerisPanel } from "@/components/panels/EphemerisPanel";

import { useNeoFeed } from "@/hooks/useNeoData";
import { useDateRange } from "@/hooks/useDateRange";
import { useSelectionStore } from "@/stores/selection-store";
import type { NeoTableRow } from "@/types/schema";

export default function DashboardPage() {
  const {
    startDate, endDate, setStartDate, setEndDate, validationError, isValid
  } = useDateRange();
  const { data, isLoading, isError, error, refetch, isFetching } = useNeoFeed(startDate, endDate);
  const { setSelected } = useSelectionStore();

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

  function handleRowClick(row: NeoTableRow) {
    setSelected(row.id, row.name);
  }

  function isRowHighlighted(row: NeoTableRow): boolean {
    return row.isHazardous;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Main Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">NASA NeoWs Data Center</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {validationError && (
            <p className="border-2 border-red-600 bg-red-600 text-white px-3 py-1.5 font-bold uppercase tracking-widest rounded-none text-sm flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              {validationError}
            </p>
          )}
          {isFetching && (
            <span className="text-black font-mono font-bold animate-pulse border-2 border-black px-2 py-1 uppercase text-sm">
              [ Fetching... ]
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2 bg-background border-2 border-foreground p-1.5 rounded-none shadow-none">
            <div className="flex items-center px-2">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 w-[130px] border-border text-sm"
              />
            </div>
            <span className="text-muted-foreground text-sm font-medium px-1">to</span>
            <div className="flex items-center px-2">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 w-[130px] border-border text-sm"
              />
            </div>
            <Button
              onClick={() => refetch()}
              disabled={!isValid || isFetching}
              size="sm"
              className="h-8 px-4 ml-1 bg-foreground hover:bg-foreground/90 text-background rounded-none font-bold uppercase tracking-widest border-2 border-foreground"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
              Fetch Data
            </Button>
          </div>
        </div>
      </div>

      {isError && (
        <div className="border-2 border-red-600 bg-red-50 text-red-600 p-4 rounded-none shadow-none dark:bg-black dark:border-red-600">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <p className="text-red-700 font-bold text-sm">Data Fetch Failed</p>
              <p className="text-red-600 text-sm mt-1">{error?.message ?? "Unknown error occurred"}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-auto border-red-300 text-red-700 hover:bg-red-100 bg-white">
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards - Circular 2x2 formation */}
      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8 max-w-4xl mx-auto">
        <StatCard
          title="Total NEOs"
          value={isLoading ? null : stats.totalCount.toString()}
          icon={<Hash className="h-5 w-5 text-blue-600" />}
          subtitle={`${startDate} → ${endDate}`}
        />
        <StatCard
          title="Hazardous"
          value={isLoading ? null : stats.hazardousCount.toString()}
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
          subtitle="Potentially hazardous asteroids"
          highlight={stats.hazardousCount > 0}
        />
        <StatCard
          title="Closest Approach"
          value={isLoading ? null : stats.closestApproach?.name ?? "—"}
          icon={<Crosshair className="h-5 w-5 text-orange-600" />}
          subtitle={
            stats.closestApproach
              ? `${stats.closestApproach.missDistanceKm.toLocaleString(undefined, { maximumFractionDigits: 0 })} km`
              : "—"
          }
        />
        <StatCard
          title="Fastest Object"
          value={isLoading ? null : stats.fastestObject?.name ?? "—"}
          icon={<Gauge className="h-5 w-5 text-green-600" />}
          subtitle={
            stats.fastestObject
              ? `${stats.fastestObject.velocityKmPerSec.toFixed(2)} km/s`
              : "—"
          }
        />
      </div>

      {/* Main content grid: Chart then Table */}
      <div className="flex flex-col gap-6">
        {/* Velocity Chart */}
        <div className="bg-background border-2 border-foreground shadow-none rounded-none p-5">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-foreground pb-3">
            <Gauge className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-card-foreground">Velocity Distribution</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <div className="h-[300px] w-full">
              <VelocityCurve data={data} />
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-background border-2 border-foreground shadow-none rounded-none p-5">
          <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-card-foreground">Near Earth Objects Data</h2>
            </div>
            <span className="text-foreground text-xs uppercase font-bold tracking-widest px-2 py-1 bg-background rounded-none border-2 border-foreground">
              {data.length} Objects Found
            </span>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
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
        </div>
      </div>

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
    <div className={`rounded-none flex flex-col items-center justify-center text-center py-6 px-4 ${highlight ? 'border-2 border-red-600 bg-red-50' : 'border-2 border-black bg-white dark:border-white dark:bg-black'}`}>
      <div className="mb-2">
        {icon}
      </div>
      <span className="text-[10px] sm:text-xs text-black dark:text-white font-bold uppercase tracking-widest px-2 leading-tight">
        {title}
      </span>
      {value !== null ? (
        <h4 className={`text-2xl sm:text-4xl font-black mt-2 tabular-nums ${highlight ? 'text-red-600' : 'text-black dark:text-white'}`}>
          {value}
        </h4>
      ) : (
        <div className="h-8 w-16 border-2 border-foreground bg-background mt-2 animate-pulse" />
      )}
      <p className={`text-[9px] sm:text-xs mt-2 sm:mt-4 px-2 sm:px-8 leading-tight ${highlight ? 'text-red-600 font-bold' : 'text-black dark:text-white font-bold'}`}>
        {subtitle}
      </p>
    </div>
  );
}
