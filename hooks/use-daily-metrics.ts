"use client";

import useSWR from "swr";
import type { DailyMetricsResponse } from "../lib/types";
import type { DailyMetricsFilters } from "../lib/api";
import { fetchDailyMetrics } from "../lib/api";

export function useDailyMetrics(filters: DailyMetricsFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR<DailyMetricsResponse>(
    ["daily-metrics", filters],
    () => fetchDailyMetrics(filters),
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    metrics: data?.data?.data || [],
    total: data?.data?.total || 0,
    hasMore: data?.data?.hasMore || false,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
