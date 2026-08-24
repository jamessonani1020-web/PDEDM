"use client";

import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Satellite,
  Search,
  AlertTriangle,
  RefreshCw,
  Info,
} from "lucide-react";
import { useHorizonsEphemeris } from "@/hooks/useNeoData";

export default function EphemerisPage() {
  const [inputValue, setInputValue] = useState("");
  const [designation, setDesignation] = useState<string | null>(null);

  const { vectors, rawResult, isLoading, isError, error, refetch } =
    useHorizonsEphemeris(designation);

  function handleSearch() {
    const trimmed = inputValue.trim();
    if (trimmed) {
      setDesignation(trimmed);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      {/* Breadcrumbs */}
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
              Ephemeris Lookup
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Satellite className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Ephemeris Lookup
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Query JPL Horizons for Cartesian state vectors of any solar system
          object by designation or name.
        </p>
      </div>

      {/* Search */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="py-4 px-5">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-md space-y-1">
              <label className="text-xs text-muted-foreground font-medium">
                Object Designation / Name
              </label>
              <Input
                type="text"
                placeholder="e.g. 499 (Mars), Ceres, 2024 AA, 3309828"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white/5 border-white/10 text-foreground h-9 text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-foreground h-9 px-5"
            >
              <Search className="h-4 w-4 mr-2" />
              Query Horizons
            </Button>
          </div>

          {/* Help text */}
          <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>
              Enter a JPL designation (e.g.{" "}
              <button
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => {
                  setInputValue("499");
                  setDesignation("499");
                }}
              >
                499
              </button>{" "}
              for Mars,{" "}
              <button
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => {
                  setInputValue("Ceres");
                  setDesignation("Ceres");
                }}
              >
                Ceres
              </button>
              ,{" "}
              <button
                className="text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => {
                  setInputValue("2012 SD22");
                  setDesignation("2012 SD22");
                }}
              >
                2012 SD22
              </button>
              ). The query is sent to JPL&apos;s Horizons system for
              geocentric state vector computation.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="py-6 px-5 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Querying JPL Horizons for &quot;{designation}&quot;...
            </div>
            <Skeleton className="h-4 w-48 bg-slate-800" />
            <Skeleton className="h-40 w-full bg-slate-800" />
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {isError && (
        <Card className="bg-red-950/20 border-red-900/50">
          <CardContent className="py-4 px-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  Horizons Query Failed
                </p>
                <p className="text-red-300/60 text-xs mt-0.5">
                  {error?.message ?? "Unknown error"}
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

      {/* Results */}
      {!isLoading && !isError && vectors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Satellite className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                State Vectors — &quot;{designation}&quot;
              </CardTitle>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="border-slate-700 text-muted-foreground text-xs"
                >
                  {vectors.length} epoch{vectors.length !== 1 ? "s" : ""}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-700 text-muted-foreground text-xs"
                >
                  VECTORS
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-700 text-muted-foreground text-xs"
                >
                  Geocentric
                </Badge>
              </div>
            </div>
          </CardHeader>
          <Separator className="bg-white/10" />
          <CardContent className="pt-4 space-y-4">
            {/* Vector table */}
            <div className="rounded-lg border border-white/10 bg-white/5 overflow-x-auto">
              <pre className="p-4 text-xs font-mono text-foreground leading-relaxed whitespace-pre">
                <span className="text-muted-foreground">
                  {"JDTDB            X (km)           Y (km)           Z (km)           VX (km/s)        VY (km/s)        VZ (km/s)\n"}
                  {"─".repeat(130) + "\n"}
                </span>
                {vectors.map((v) => (
                  <span key={v.jdtdb}>
                    {`${v.jdtdb.toFixed(6).padEnd(17)}${v.x.toExponential(8).padStart(17)}${v.y.toExponential(8).padStart(17)}${v.z.toExponential(8).padStart(17)}${v.vx.toExponential(8).padStart(17)}${v.vy.toExponential(8).padStart(17)}${v.vz.toExponential(8).padStart(17)}\n`}
                  </span>
                ))}
              </pre>
            </div>

            {/* Calendar dates */}
            <div>
              <h3 className="text-foreground text-sm font-semibold mb-2">
                Epoch Calendar Dates
              </h3>
              <div className="space-y-1">
                {vectors.map((v) => (
                  <div
                    key={v.jdtdb}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-muted-foreground font-mono tabular-nums">
                      JD {v.jdtdb.toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-foreground">
                      {v.calendarDate || "N/A"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No vectors but result returned */}
      {!isLoading && !isError && vectors.length === 0 && rawResult && (
        <Card className="bg-amber-950/20 border-amber-900/40">
          <CardContent className="py-4 px-5">
            <p className="text-amber-400 text-sm font-semibold mb-1">
              No Ephemeris Computed
            </p>
            <p className="text-amber-300/60 text-xs">
              Horizons returned object data but no state vectors. The object
              may not have sufficient orbital data, or the designation may
              need a different format.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Raw response */}
      {!isLoading && rawResult && (
        <details className="group">
          <summary className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors">
            View raw Horizons response
          </summary>
          <Card className="mt-2 bg-white/5 border-white/10">
            <CardContent className="py-3 px-4">
              <pre className="text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {rawResult}
              </pre>
            </CardContent>
          </Card>
        </details>
      )}
    </div>
  );
}
