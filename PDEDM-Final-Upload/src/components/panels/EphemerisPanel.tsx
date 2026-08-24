"use client";

import { useEffect, useState, useRef } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useSelectionStore } from "@/stores/selection-store";
import { useHorizonsEphemeris } from "@/hooks/useNeoData";
import { AlertTriangle, RefreshCw, Satellite, X } from "lucide-react";

export function EphemerisPanel() {
  const { selectedNeoId, selectedNeoName, clearSelected } =
    useSelectionStore();

  const { vectors, rawResult, isLoading, isError, error, refetch } =
    useHorizonsEphemeris(selectedNeoId);

  const isOpen = selectedNeoId !== null;

  // Custom resizing logic
  const [panelWidth, setPanelWidth] = useState(560);
  const isResizing = useRef(false);

  const startResizing = (e: React.PointerEvent) => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isResizing.current) return;
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.max(300, Math.min(newWidth, window.innerWidth - 64))); // Min 300px, max screen width minus sidebar
    };
    const handlePointerUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && clearSelected()}>
      <SheetContent
        style={{ width: panelWidth, maxWidth: "100vw" }}
        className="bg-white/5 border-l border-white/10 backdrop-blur-xl overflow-y-auto p-0 transition-none"
      >
        {/* Drag Handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-white/10 active:bg-white/20 transition-colors z-50 flex items-center justify-center group"
          onPointerDown={startResizing}
        >
          <div className="h-12 w-0.5 bg-white/20 rounded-full group-hover:bg-white/50 transition-colors" />
        </div>

        <div className="p-6 h-full">
          <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Satellite className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <SheetTitle className="text-foreground text-lg">
                Ephemeris Data
              </SheetTitle>
            </div>
          </div>
          <SheetDescription className="text-muted-foreground">
            JPL Horizons Cartesian state vectors for{" "}
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {selectedNeoName ?? selectedNeoId}
            </span>
          </SheetDescription>
        </SheetHeader>

        <Separator className="bg-slate-800" />

        <div className="mt-4 space-y-4">
          {/* Info badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="border-slate-700 text-muted-foreground text-xs"
            >
              Source: JPL Horizons
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-700 text-muted-foreground text-xs"
            >
              Type: VECTORS
            </Badge>
            <Badge
              variant="outline"
              className="border-slate-700 text-muted-foreground text-xs"
            >
              Center: Earth (Geocentric)
            </Badge>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48 bg-slate-800" />
              <Skeleton className="h-40 w-full bg-slate-800" />
              <Skeleton className="h-4 w-32 bg-slate-800" />
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">
                  Ephemeris Lookup Failed
                </span>
              </div>
              <p className="text-red-300/70 text-xs mb-3">
                {error?.message ?? "An unknown error occurred."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-red-800 text-red-400 hover:bg-red-950/40"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {/* Success: state vectors */}
          {!isLoading && !isError && vectors.length > 0 && (
            <>
              <div>
                <h3 className="text-foreground text-sm font-semibold mb-2">
                  State Vectors ({vectors.length} epoch
                  {vectors.length !== 1 ? "s" : ""})
                </h3>
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
            </>
          )}

          {/* No vectors but no error (Horizons returned data but no ephemeris) */}
          {!isLoading && !isError && vectors.length === 0 && rawResult && (
            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4">
              <p className="text-amber-400 text-sm font-semibold mb-1">
                No Ephemeris Computed
              </p>
              <p className="text-amber-300/60 text-xs">
                Horizons returned object data but no state vectors were
                computed for this designation. The object may not have
                sufficient orbital data.
              </p>
            </div>
          )}

          {/* Raw response (collapsible) */}
          {!isLoading && rawResult && (
            <details className="group">
              <summary className="text-muted-foreground text-xs cursor-pointer hover:text-foreground transition-colors">
                View raw Horizons response
              </summary>
              <div className="mt-2 rounded-lg border border-white/10 bg-black/20 overflow-x-auto">
                <pre className="p-3 text-[10px] font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                  {rawResult}
                </pre>
              </div>
            </details>
          )}
        </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
