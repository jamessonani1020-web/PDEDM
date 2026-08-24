"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNeoFeed, fetchHorizonsEphemeris } from "@/lib/api/nasa-client";
import type { NeoTableRow, StateVector } from "@/types/schema";

// ---------------------------------------------------------------------------
// NeoWs Feed Hook
// ---------------------------------------------------------------------------

interface UseNeoFeedReturn {
  data: NeoTableRow[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isFetching: boolean;
}

export function useNeoFeed(
  startDate: string,
  endDate: string
): UseNeoFeedReturn {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<
    NeoTableRow[],
    Error
  >({
    queryKey: ["neo-feed", startDate, endDate],
    queryFn: () => fetchNeoFeed(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!startDate && !!endDate,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return {
    data: data ?? [],
    isLoading,
    isError,
    error: error ?? null,
    refetch,
    isFetching,
  };
}

// ---------------------------------------------------------------------------
// JPL Horizons Ephemeris Hook
// ---------------------------------------------------------------------------

interface UseHorizonsEphemerisReturn {
  vectors: StateVector[];
  rawResult: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHorizonsEphemeris(
  designation: string | null
): UseHorizonsEphemerisReturn {
  const { data, isLoading, isError, error, refetch } = useQuery<
    { vectors: StateVector[]; rawResult: string },
    Error
  >({
    queryKey: ["horizons-ephemeris", designation],
    queryFn: () => {
      if (!designation) throw new Error("No designation provided");
      return fetchHorizonsEphemeris(designation);
    },
    enabled: !!designation,
    staleTime: 10 * 60 * 1000, // 10 minutes (ephemeris data doesn't change often)
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });

  return {
    vectors: data?.vectors ?? [],
    rawResult: data?.rawResult ?? "",
    isLoading,
    isError,
    error: error ?? null,
    refetch,
  };
}
