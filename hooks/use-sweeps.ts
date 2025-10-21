"use client";
import useSWR from "swr";
import type { SweepsResponse, AggregatedSweepsResponse } from "../lib/types";
import type { SweepsFilters, AggregatedSweepsFilters } from "../lib/api";
import { fetchSweeps, fetchAggregatedSweeps } from "../lib/api";

export function useSweeps(filters: SweepsFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR<SweepsResponse>(
    ["sweeps", filters],
    () => fetchSweeps(filters),
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    sweeps: data?.data?.data || [],
    total: data?.data?.total || 0,
    hasMore: data?.data?.hasMore || false,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

export function useAggregatedSweeps(filters: AggregatedSweepsFilters = {}) {
  const { data, error, isLoading, mutate } = useSWR<AggregatedSweepsResponse>(
    ["aggregated-sweeps", filters],
    () => fetchAggregatedSweeps(filters),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    aggregatedData: data?.data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
