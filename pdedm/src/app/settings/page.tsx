"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Key,
  Activity,
  Globe,
  Info,
  Monitor,
  Moon,
  Sun,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useRateLimitStore } from "@/stores/rate-limit-store";

export default function SettingsPage() {
  const { limit, remaining, lastUpdated } = useRateLimitStore();
  const [apiKey, setApiKey] = useState("Loading...");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setApiKey(data.isDemo ? "DEMO_KEY" : "PRODUCTION_KEY"))
      .catch(() => setApiKey("Unknown"));
  }, []);

  const quotaPercentage =
    limit !== null && remaining !== null
      ? Math.round((remaining / limit) * 100)
      : null;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
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
              Settings
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure API access, view quota usage, and manage preferences.
        </p>
      </div>


      {/* API Quota Usage */}
      <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            API Quota Usage
          </CardTitle>
        </CardHeader>
        <Separator className="bg-foreground h-[2px]" />
        <CardContent className="pt-4 space-y-4">
          {quotaPercentage !== null ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Limit
                  </p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {limit}
                  </p>
                  <p className="text-xs text-muted-foreground">requests/hour</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Remaining
                  </p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {remaining}
                  </p>
                  <p className="text-xs text-muted-foreground">requests left</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Used
                  </p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {limit !== null && remaining !== null
                      ? limit - remaining
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">this window</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Usage</span>
                  <span>{100 - quotaPercentage}%</span>
                </div>
                <div className="w-full h-4 bg-muted border-2 border-foreground overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      quotaPercentage > 50
                        ? "bg-emerald-500"
                        : quotaPercentage > 20
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${quotaPercentage}%` }}
                  />
                </div>
              </div>

              {lastUpdated && (
                <p className="text-[11px] text-muted-foreground">
                  Last updated:{" "}
                  {new Date(lastUpdated).toLocaleString()}
                </p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              No API requests made yet. Quota data will appear after your
              first fetch.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            Appearance
          </CardTitle>
        </CardHeader>
        <Separator className="bg-foreground h-[2px]" />
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className={`border-2 border-foreground rounded-none uppercase tracking-widest font-bold ${theme === "light" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background"}`}
              onClick={() => setTheme("light")}
            >
              [ Light ]
            </Button>
            <Button
              variant="outline"
              className={`border-2 border-foreground rounded-none uppercase tracking-widest font-bold ${theme === "dark" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background"}`}
              onClick={() => setTheme("dark")}
            >
              [ Dark ]
            </Button>
            <Button
              variant="outline"
              className={`border-2 border-foreground rounded-none uppercase tracking-widest font-bold ${theme === "system" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-foreground hover:text-background"}`}
              onClick={() => setTheme("system")}
            >
              [ System ]
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            Data Sources
          </CardTitle>
        </CardHeader>
        <Separator className="bg-foreground h-[2px]" />
        <CardContent className="pt-4 space-y-3">
          <DataSourceRow
            name="NASA NeoWs"
            description="Near Earth Object Web Service — provides NEO orbital data and close approach information"
            url="https://api.nasa.gov/"
            status="active"
          />
          <DataSourceRow
            name="JPL Horizons"
            description="Solar System Dynamics — provides high-precision ephemeris and state vector computations"
            url="https://ssd.jpl.nasa.gov/horizons/"
            status="active"
          />
        </CardContent>
      </Card>

      {/* About */}
      <Card className="rounded-none border-2 border-foreground bg-background shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            About PDEDM
          </CardTitle>
        </CardHeader>
        <Separator className="bg-foreground h-[2px]" />
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-y-2 text-sm max-w-md">
            <span className="text-muted-foreground">Version</span>
            <span className="text-foreground">1.0.0</span>
            <span className="text-muted-foreground">Framework</span>
            <span className="text-foreground">Next.js 16 (App Router)</span>
            <span className="text-muted-foreground">Validation</span>
            <span className="text-foreground">Zod + TypeScript strict</span>
            <span className="text-muted-foreground">Data Grid</span>
            <span className="text-foreground">TanStack Table v8</span>
            <span className="text-muted-foreground">Charts</span>
            <span className="text-foreground">Recharts v2</span>
            <span className="text-muted-foreground">State</span>
            <span className="text-foreground">Zustand + TanStack Query</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataSourceRow({
  name,
  description,
  url,
  status,
}: {
  name: string;
  description: string;
  url: string;
  status: "active" | "inactive";
}) {
  return (
    <div className="flex items-start justify-between p-3 rounded-none border-2 border-foreground bg-background">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground uppercase tracking-widest">{name}</span>
          <span
            className={`text-[10px] px-1.5 py-0.5 border-2 rounded-none font-bold uppercase tracking-widest ${
              status === "active"
                ? "border-green-600 bg-green-600 text-white"
                : "border-red-600 bg-red-600 text-white"
            }`}
          >
            {status}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
        onClick={() => window.open(url, "_blank")}
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
