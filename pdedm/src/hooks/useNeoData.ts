"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNeoFeed, fetchHorizonsEphemeris } from "@/lib/api/nasa-client";
import type { NeoTableRow, StateVector } from "@/types/schema";

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
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
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

interface UseHorizonsEphemerisReturn {
  vectors: StateVector[];
  rawResult: string;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useHorizonsEphemeris(
  designation: string | null,
  startDate?: string,
  endDate?: string
): UseHorizonsEphemerisReturn {
  const { data, isLoading, isError, error, refetch } = useQuery<
    { vectors: StateVector[]; rawResult: string },
    Error
  >({
    queryKey: ["horizons-ephemeris", designation, startDate, endDate],
    queryFn: () => {
      if (!designation) throw new Error("No designation provided");
      return fetchHorizonsEphemeris(designation, "500@399", startDate, endDate);
    },
    enabled: !!designation,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
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
