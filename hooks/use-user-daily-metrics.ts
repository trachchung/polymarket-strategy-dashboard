"use client";

import useSWR from "swr";
import type { UserDailyMetricsResponse } from "../lib/types";
import type { UserDailyMetricsFilters } from "../lib/api";
import { fetchUserDailyMetrics } from "../lib/api";

export function useUserDailyMetrics(filters: UserDailyMetricsFilters) {
  const { data, error, isLoading, mutate } = useSWR<UserDailyMetricsResponse>(
    ["user-daily-metrics", filters],
    () => fetchUserDailyMetrics(filters),
    {
      refreshInterval: 60000, // Refresh every 60 seconds
      revalidateOnFocus: true,
      // Only fetch if address is provided
      revalidateIfStale: !!filters.address,
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
