"use client";

import { useState, useCallback, useMemo } from "react";
import { format, addDays } from "date-fns";

interface UseDateRangeReturn {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  validationError: string | null;
  isValid: boolean;
}

/**
 * Manages start/end date state for the NeoWs feed.
 * NeoWs limits queries to a maximum 7-day range.
 */
export function useDateRange(): UseDateRangeReturn {
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const weekFromNow = useMemo(
    () => format(addDays(new Date(), 7), "yyyy-MM-dd"),
    []
  );

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(weekFromNow);

  const validationError = useMemo(() => {
    if (!startDate || !endDate) return "Both dates are required";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "Invalid date format";
    }
    if (end < start) {
      return "End date must be after start date";
    }

    const diffDays =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      return "NeoWs API limits queries to 7 days maximum";
    }

    return null;
  }, [startDate, endDate]);

  const handleSetStart = useCallback((date: string) => {
    setStartDate(date);
  }, []);

  const handleSetEnd = useCallback((date: string) => {
    setEndDate(date);
  }, []);

  return {
    startDate,
    endDate,
    setStartDate: handleSetStart,
    setEndDate: handleSetEnd,
    validationError,
    isValid: validationError === null,
  };
}
