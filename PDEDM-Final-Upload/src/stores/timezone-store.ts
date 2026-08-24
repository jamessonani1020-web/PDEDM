import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TimezoneOption {
  id: string;
  label: string;
  iana: string; // The exact IANA timezone string, or 'local' for system local
}

export const TIMEZONES: TimezoneOption[] = [
  { id: "local", label: "Local System Time", iana: "local" },
  { id: "utc", label: "UTC (Coordinated Universal)", iana: "UTC" },
  { id: "est", label: "Eastern Time (US)", iana: "America/New_York" },
  { id: "pst", label: "Pacific Time (US)", iana: "America/Los_Angeles" },
  { id: "cet", label: "Central European Time", iana: "Europe/Paris" },
  { id: "jst", label: "Japan Standard Time", iana: "Asia/Tokyo" },
  { id: "aest", label: "Australian Eastern Time", iana: "Australia/Sydney" },
];

interface TimezoneState {
  selectedTimezone: TimezoneOption;
  setTimezone: (timezoneId: string) => void;
}

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set) => ({
      selectedTimezone: TIMEZONES[1], // Default to UTC
      setTimezone: (timezoneId: string) => {
        const found = TIMEZONES.find((tz) => tz.id === timezoneId);
        if (found) {
          set({ selectedTimezone: found });
        }
      },
    }),
    {
      name: "pdedm-timezone-storage",
    }
  )
);
