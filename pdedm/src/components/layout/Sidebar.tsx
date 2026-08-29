"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Satellite,
  Settings,
  Activity,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";



import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRateLimitStore } from "@/stores/rate-limit-store";
import { useTimezoneStore, TIMEZONES } from "@/stores/timezone-store";
import { useSelectionStore } from "@/stores/selection-store";

import { useSidebarStore } from "@/stores/sidebar-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const { limit, remaining } = useRateLimitStore();
  const { selectedTimezone, setTimezone } = useTimezoneStore();
  const { isCollapsed, setIsCollapsed } = useSidebarStore();

  // Live clock
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  
  const { clearSelected } = useSelectionStore();

  useEffect(() => {
    clearSelected();
  }, [pathname, clearSelected]);

  useEffect(() => {
    function tick() {
      const now = new Date();
      
      const optionsTime: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };
      
      const optionsDate: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      if (selectedTimezone.iana !== "local") {
        optionsTime.timeZone = selectedTimezone.iana;
        optionsDate.timeZone = selectedTimezone.iana;
      }

      setTimeStr(now.toLocaleTimeString("en-US", optionsTime));
      setDateStr(now.toLocaleDateString("en-US", optionsDate));
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      label: "Public Briefing",
      href: "/briefing",
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Ephemeris",
      href: "/ephemeris",
      icon: <Satellite className="h-5 w-5" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const quotaPercentage =
    limit !== null && remaining !== null
      ? Math.round((remaining / limit) * 100)
      : null;

  return (
    <aside className={`${isCollapsed ? 'w-[70px]' : 'w-[250px]'} transition-all duration-300 min-h-screen bg-background border-r-2 border-border flex flex-col flex-shrink-0`}>
      {/* Logo */}
      <div className={`p-4 flex items-center justify-between`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div className="h-10 w-10 flex items-center justify-center flex-shrink-0">
            <Satellite className="h-8 w-8 text-foreground" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-foreground leading-tight whitespace-nowrap">
                PDEDM
              </h1>
              <p className="text-[10px] text-muted-foreground leading-tight whitespace-nowrap">
                Planetary Defense
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className="px-4 pb-2 flex justify-center">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <Separator className="bg-border h-[2px]" />

      {/* Live Clock with Timezone Selector */}
      <div className={`px-4 py-3 space-y-0.5 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="flex items-center justify-between text-xs text-muted-foreground relative group">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>Time</span>
          </div>
          <select 
            className="absolute inset-0 opacity-0 cursor-pointer"
            value={selectedTimezone.id}
            onChange={(e) => setTimezone(e.target.value)}
          >
            {TIMEZONES.map(tz => <option key={tz.id} value={tz.id}>{tz.label}</option>)}
          </select>
          <span className="bg-accent px-1.5 py-0.5 rounded text-[10px] group-hover:bg-accent/80 transition-colors pointer-events-none text-foreground font-medium uppercase tracking-wider">
            {selectedTimezone.id}
          </span>
        </div>
        <p className="text-lg font-bold text-foreground tabular-nums font-mono leading-tight pt-1">
          {timeStr || "--:--:--"}
        </p>
        <p className="text-[11px] text-muted-foreground">{dateStr || "Loading..."}</p>
      </div>

      <Separator className="bg-border h-[2px]" />

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger
                render={
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 py-3 font-bold uppercase tracking-widest border-2 transition-all
                      ${isCollapsed ? 'justify-center px-0' : 'px-4'}
                      ${
                        isActive
                          ? "border-foreground bg-foreground text-background"
                          : "border-transparent text-muted-foreground hover:border-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </Link>
                }
              />
              <TooltipContent side="right">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="bg-border h-[2px]" />

      {/* Rate Limit Indicator */}
      <div className={`p-4 space-y-2 ${isCollapsed ? 'hidden' : 'block'}`}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          <span>API Quota</span>
        </div>

        {quotaPercentage !== null ? (
          <>
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
            <p className="text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
              {remaining} / {limit} requests remaining
            </p>
          </>
        ) : (
          <p className="text-[11px] text-muted-foreground">No data yet</p>
        )}
      </div>


    </aside>
  );
}
