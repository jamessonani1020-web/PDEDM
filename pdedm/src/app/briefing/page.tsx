"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import { Users, ShieldCheck, ShieldAlert, Rocket, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useNeoFeed } from "@/hooks/useNeoData";
import { useDateRange } from "@/hooks/useDateRange";
import {
  getSizeAnalogy,
  getSpeedAnalogy,
  getDistanceAnalogy,
} from "@/lib/utils/analogies";

export default function BriefingPage() {
  const { startDate, endDate } = useDateRange();
  const { data: neos, isLoading, isError } = useNeoFeed(startDate, endDate);

  const [hazardOnly, setHazardOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "closest" | "largest" | "fastest">("date");

  const { hasHazard, largest, fastest, closest } = useMemo(() => {
    if (!neos.length) {
      return {
        hasHazard: false,
        largest: null,
        fastest: null,
        closest: null,
      };
    }

    let hasHazard = false;
    let largest = neos[0];
    let fastest = neos[0];
    let closest = neos[0];

    for (const neo of neos) {
      if (neo.isHazardous) hasHazard = true;
      if (neo.diameterMaxMeters > largest.diameterMaxMeters) largest = neo;
      if (neo.velocityKmPerSec > fastest.velocityKmPerSec) fastest = neo;
      if (neo.missDistanceLunar < closest.missDistanceLunar) closest = neo;
    }

    return { hasHazard, largest, fastest, closest };
  }, [neos]);

  if (isError) {
    return (
      <div className="p-6">
        <h1 className="text-xl text-red-500">
          Error loading planetary defense data.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto pb-24">
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
              Public Briefing
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          Public Briefing
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          A plain-English summary of near-Earth object activity for the upcoming 7 days.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 w-full rounded-none border-2 border-foreground bg-muted animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 rounded-none border-2 border-foreground bg-muted animate-pulse" />
            <div className="h-48 rounded-none border-2 border-foreground bg-muted animate-pulse" />
            <div className="h-48 rounded-none border-2 border-foreground bg-muted animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          {/* Main Threat Level Banner */}
          <div className="rounded-none border-2 border-foreground bg-background p-4">
            <div className="flex items-center gap-2 mb-2">
              {hasHazard ? (
                <ShieldAlert className="h-6 w-6 text-foreground" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-foreground" />
              )}
              <h2 className="text-lg font-bold text-foreground">
                {hasHazard
                  ? "Condition Yellow: Hazards Monitored"
                  : "Condition Green: Earth is Safe"}
              </h2>
            </div>
            <p className="text-foreground text-sm">
              {hasHazard
                ? "NASA is currently tracking one or more potentially hazardous objects this week. There is no immediate threat of impact, but they are being actively monitored."
                : "No potentially hazardous objects are currently passing near Earth. The planetary defense network reports no immediate threats."}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {neos.length} total objects passing safely this week
            </p>
          </div>

          <h3 className="text-xl font-bold text-foreground pt-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Notable Flybys This Week
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Closest Object */}
            <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
              <CardHeader className="pb-2 border-b-2 border-foreground">
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest">
                  The Closest Object
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {closest ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {closest.name}
                      </p>
                      <p className="text-foreground text-sm">
                        {getDistanceAnalogy(closest.missDistanceLunar)}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Science:</span> Missed Earth by {Math.round(closest.missDistanceKm).toLocaleString()} km on {closest.approachDate}.
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Largest Object */}
            <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
              <CardHeader className="pb-2 border-b-2 border-foreground">
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest">
                  The Largest Object
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {largest ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {largest.name}
                      </p>
                      <p className="text-foreground text-sm">
                        {getSizeAnalogy(largest.diameterMaxMeters)}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Science:</span> Estimated to be up to {Math.round(largest.diameterMaxMeters)} meters in diameter.
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available.</p>
                )}
              </CardContent>
            </Card>

            {/* Fastest Object */}
            <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
              <CardHeader className="pb-2 border-b-2 border-foreground">
                <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest">
                  The Fastest Object
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {fastest ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-bold text-foreground">
                        {fastest.name}
                      </p>
                      <p className="text-foreground text-sm">
                        {getSpeedAnalogy(fastest.velocityKmPerSec)}
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Science:</span> Traveling at {fastest.velocityKmPerSec.toFixed(1)} km/s relative to Earth.
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No data available.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-8 pb-4 border-b border-border gap-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Forecasted Events This Week
              <span className="ml-2 text-xs text-muted-foreground border border-border px-1 rounded">Forecast</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHazardOnly(!hazardOnly)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-widest border-2 border-foreground rounded-none ${hazardOnly ? 'bg-foreground text-background' : 'bg-background hover:bg-foreground hover:text-background'}`}
              >
                [ Hazardous Only ]
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "closest" | "largest" | "fastest")}
                className="bg-background border-2 border-foreground text-foreground text-xs font-bold uppercase tracking-widest rounded-none px-3 py-1.5 outline-none cursor-pointer"
              >
                <option value="date">Group by Date</option>
                <option value="closest">Sort by Closest</option>
                <option value="largest">Sort by Largest</option>
                <option value="fastest">Sort by Fastest</option>
              </select>
            </div>
          </div>

          {/* Grouped Events */}
          <div className="space-y-8 pt-4">
            {Object.entries(
              neos
                .filter((neo) => (hazardOnly ? neo.isHazardous : true))
                .sort((a, b) => {
                  if (sortBy === "closest") return a.missDistanceLunar - b.missDistanceLunar;
                  if (sortBy === "largest") return b.diameterMaxMeters - a.diameterMaxMeters;
                  if (sortBy === "fastest") return b.velocityKmPerSec - a.velocityKmPerSec;
                  // Date sort
                  return new Date(b.approachDate).getTime() - new Date(a.approachDate).getTime();
                })
                .reduce((acc, neo) => {
                  const groupKey = sortBy === "date" ? neo.approachDate : "All Events";
                  if (!acc[groupKey]) acc[groupKey] = [];
                  acc[groupKey].push(neo);
                  return acc;
                }, {} as Record<string, typeof neos>)
            )
              .sort((a, b) => (sortBy === "date" ? new Date(b[0]).getTime() - new Date(a[0]).getTime() : 0))
              .map(([groupDate, groupedNeos]) => (
                <div key={groupDate} className="space-y-4">
                  {sortBy === "date" && (
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest pl-1">
                      {format(new Date(groupDate), "MMMM do, yyyy")}
                    </h4>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {groupedNeos.map((neo) => (
                      <Card key={`${neo.id}-${neo.velocityKmPerSec}`} className="rounded-none shadow-none border-2 border-foreground bg-background">
                        <CardHeader className="pb-2 border-b-2 border-foreground">
                          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest flex justify-between items-center">
                            {neo.name}
                            <div className="flex items-center gap-1.5">
                              {new Date(neo.approachDate) > new Date() && (
                                <span className="text-[10px] text-muted-foreground">Future</span>
                              )}
                              {neo.isHazardous && (
                                <span className="text-[10px] border-2 border-red-600 bg-red-600 text-white px-1 font-bold rounded-none">Hazard</span>
                              )}
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-3">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs text-foreground">
                              {getSizeAnalogy(neo.diameterMaxMeters)}
                            </p>
                            <p className="text-xs text-foreground">
                              {getDistanceAnalogy(neo.missDistanceLunar)}
                            </p>
                            <p className="text-xs text-foreground">
                              {getSpeedAnalogy(neo.velocityKmPerSec)}
                            </p>
                          </div>
                          {sortBy !== "date" && (
                            <div className="pt-2 text-xs text-muted-foreground border-t border-border mt-2">
                              Passing on {neo.approachDate}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            
            {neos.filter((neo) => (hazardOnly ? neo.isHazardous : true)).length === 0 && (
              <div className="p-8 text-center text-foreground font-bold border-2 border-foreground rounded-none bg-background">
                No events found for the selected filters.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
