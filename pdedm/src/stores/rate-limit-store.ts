import { create } from "zustand";

interface RateLimitState {
  limit: number | null;
  remaining: number | null;
  lastUpdated: number | null;
  setRateLimit: (limit: number | null, remaining: number | null) => void;
  reset: () => void;
}

export const useRateLimitStore = create<RateLimitState>((set) => ({
  limit: null,
  remaining: null,
  lastUpdated: null,
  setRateLimit: (limit, remaining) =>
    set({
      limit,
      remaining,
      lastUpdated: Date.now(),
    }),
  reset: () =>
    set({
      limit: null,
      remaining: null,
      lastUpdated: null,
    }),
}));
