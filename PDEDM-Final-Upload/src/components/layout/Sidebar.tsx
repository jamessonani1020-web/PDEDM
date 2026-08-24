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
} from "lucide-react";

function CustomLogo() {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
      <circle cx="50" cy="50" r="22" stroke="url(#logoGrad)" strokeWidth="8" />
      <ellipse cx="50" cy="50" rx="42" ry="14" transform="rotate(-20 50 50)" stroke="white" strokeWidth="4" strokeOpacity="0.8" />
      <defs>
        <linearGradient id="logoGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRateLimitStore } from "@/stores/rate-limit-store";
import { useTimezoneStore, TIMEZONES } from "@/stores/timezone-store";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const pathname = usePathname();
  const { limit, remaining } = useRateLimitStore();
  const { selectedTimezone, setTimezone } = useTimezoneStore();

  // Live clock
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

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
    <aside className="w-[220px] min-h-screen glass-panel flex flex-col m-4 rounded-2xl">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/20">
          <CustomLogo />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground leading-tight">
            PDEDM
          </h1>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Planetary Defense
          </p>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Live Clock with Timezone Selector */}
      <div className="px-4 py-3 space-y-0.5">
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
          <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] group-hover:bg-white/20 transition-colors pointer-events-none text-foreground font-medium uppercase tracking-wider">
            {selectedTimezone.id}
          </span>
        </div>
        <p className="text-lg font-bold text-foreground tabular-nums font-mono leading-tight pt-1">
          {timeStr || "--:--:--"}
        </p>
        <p className="text-[11px] text-muted-foreground">{dateStr || "Loading..."}</p>
      </div>

      <Separator className="bg-white/10" />

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
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                      ${
                        isActive
                          ? "bg-white/20 text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/20"
                          : "text-foreground hover:text-foreground hover:bg-white/10"
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                }
              />
              <TooltipContent side="right" className="bg-slate-800 text-foreground">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <Separator className="bg-slate-800" />

      {/* Rate Limit Indicator */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          <span>API Quota</span>
        </div>

        {quotaPercentage !== null ? (
          <>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  quotaPercentage > 50
                    ? "bg-emerald-500"
                    : quotaPercentage > 20
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${quotaPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground tabular-nums">
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
