import axios from "axios";
import type {
  SweepsResponse,
  AggregatedSweepsResponse,
  DailyMetricsResponse,
  UserDailyMetricsResponse,
  SweepSortField,
  SortDirection,
  AggregationPeriod,
  MarketType,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8080";

export interface SweepsFilters {
  limit?: number;
  offset?: number;
  market_slug?: string;
  market_question?: string;
  market_type?: MarketType;
  sort_field?: SweepSortField;
  sort_direction?: SortDirection;
}

export interface AggregatedSweepsFilters {
  period?: AggregationPeriod;
  market_type?: MarketType;
}

export interface DailyMetricsFilters {
  limit?: number;
  offset?: number;
}

export interface UserDailyMetricsFilters {
  address: string;
  limit?: number;
  offset?: number;
}

export interface UsersDailyMetricsFilters {
  addresses: string[]; // Array of addresses to aggregate
  limit?: number;
  offset?: number;
}

export async function fetchSweeps(
  filters: SweepsFilters = {}
): Promise<SweepsResponse> {
  const params = new URLSearchParams();

  // Set defaults
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;
  const sort_field = filters.sort_field ?? "created_at";
  const sort_direction = filters.sort_direction ?? "desc";

  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  params.append("sort_field", sort_field);
  params.append("sort_direction", sort_direction);

  if (filters.market_slug) {
    params.append("market_slug", filters.market_slug);
  }
  if (filters.market_question) {
    params.append("market_question", filters.market_question);
  }
  if (filters.market_type) {
    params.append("market_type", filters.market_type);
  }

  const queryString = params.toString();
  const url = `${API_URL}/api/sweeps?${queryString}`;

  try {
    const response = await axios.get<SweepsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching sweeps:", error);
    throw error;
  }
}

export async function fetchAggregatedSweeps(
  filters: AggregatedSweepsFilters = {}
): Promise<AggregatedSweepsResponse> {
  const params = new URLSearchParams();

  // Set defaults
  const period = filters.period ?? "all";
  params.append("period", period);

  if (filters.market_type) {
    params.append("market_type", filters.market_type);
  }

  const queryString = params.toString();
  const url = `${API_URL}/api/sweeps/aggregated?${queryString}`;

  try {
    const response = await axios.get<AggregatedSweepsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching aggregated sweeps:", error);
    throw error;
  }
}

export async function fetchDailyMetrics(
  filters: DailyMetricsFilters = {}
): Promise<DailyMetricsResponse> {
  const params = new URLSearchParams();

  // Set defaults
  const limit = filters.limit ?? 30;
  const offset = filters.offset ?? 0;

  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/sweeps/daily-metrics?${queryString}`;

  try {
    const response = await axios.get<DailyMetricsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching daily metrics:", error);
    throw error;
  }
}

export async function fetchUserDailyMetrics(
  filters: UserDailyMetricsFilters
): Promise<UserDailyMetricsResponse> {
  const params = new URLSearchParams();

  // Set defaults
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/users/${filters.address}/daily-metrics?${queryString}`;

  try {
    const response = await axios.get<UserDailyMetricsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching user daily metrics:", error);
    throw error;
  }
}

export async function fetchUsersDailyMetrics(
  filters: UsersDailyMetricsFilters
): Promise<UserDailyMetricsResponse> {
  const params = new URLSearchParams();

  // Set defaults
  const limit = filters.limit ?? 50;
  const offset = filters.offset ?? 0;

  // Join addresses with comma
  params.append("addresses", filters.addresses.join(","));
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/users/daily-metrics?${queryString}`;

  try {
    const response = await axios.get<UserDailyMetricsResponse>(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching users daily metrics:", error);
    throw error;
  }
}
