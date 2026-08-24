import { create } from "zustand";

interface RateLimitState {
  /** Maximum requests allowed per hour */
  limit: number | null;
  /** Remaining requests in the current window */
  remaining: number | null;
  /** Timestamp of the last update */
  lastUpdated: number | null;
  /** Update rate limit values from API response headers */
  setRateLimit: (limit: number | null, remaining: number | null) => void;
  /** Reset to unknown state */
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
