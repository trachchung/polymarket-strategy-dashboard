// Sweeps API Types based on swagger.json and response examples

export interface MarketTag {
  id: string;
  slug: string;
  label: string;
  forceShow: boolean;
  updatedAt: string;
}

export interface MarketSeries {
  id: string;
  new: boolean;
  cyom: boolean;
  icon: string;
  slug: string;
  image: string;
  title: string;
  active: boolean;
  closed: boolean;
  layout: string;
  ticker: string;
  volume: number;
  archived: boolean;
  featured: boolean;
  subtitle: string;
  createdAt: string;
  createdBy: string;
  liquidity: number;
  startDate: string;
  updatedAt: string;
  updatedBy: string;
  recurrence: string;
  restricted: boolean;
  seriesType: string;
  volume24hr: number;
  cgAssetName: string;
  competitive: string;
  publishedAt: string;
  pythTokenID: string;
  commentCount: number;
  commentsEnabled: boolean;
}

export interface MarketEvent {
  id: string;
  new: boolean;
  cyom: boolean;
  icon: string;
  slug: string;
  image: string;
  title: string;
  active: boolean;
  closed: boolean;
  series: MarketSeries[];
  ticker: string;
  volume: number;
  endDate: string;
  endTime: string;
  negRisk: boolean;
  archived: boolean;
  featured: boolean;
  createdAt: string;
  deploying: boolean;
  liquidity: number;
  startDate: string;
  startTime: string;
  updatedAt: string;
  volume1mo: number;
  volume1wk: number;
  volume1yr: number;
  closedTime: string;
  restricted: boolean;
  seriesSlug: string;
  volume24hr: number;
  competitive: number;
  description: string;
  commentCount: number;
  creationDate: string;
  gmpChartMode: string;
  openInterest: number;
  enableNegRisk: boolean;
  liquidityClob: number;
  enableOrderBook: boolean;
  showAllOutcomes: boolean;
  negRiskAugmented: boolean;
  resolutionSource: string;
  showMarketImages: boolean;
  finishedTimestamp: string;
  pendingDeployment: boolean;
  deployingTimestamp: string;
  automaticallyActive: boolean;
  scheduledDeploymentTimestamp: string;
}

export interface Market {
  id: string;
  new: boolean;
  cyom: boolean;
  icon: string;
  slug: string;
  tags: MarketTag[];
  image: string;
  ready: boolean;
  active: boolean;
  closed: boolean;
  events: MarketEvent[];
  funded: boolean;
  spread: number;
  volume: string;
  bestAsk: number;
  bestBid: number;
  endDate: string;
  endTime: string;
  negRisk: boolean;
  umaBond: string;
  approved: boolean;
  archived: boolean;
  featured: boolean;
  outcomes: string;
  question: string;
  createdAt: string;
  deploying: boolean;
  liquidity: string;
  startDate: string;
  startTime: string;
  umaReward: string;
  updatedAt: string;
  volume1mo: number;
  volume1wk: number;
  volume1yr: number;
  volumeNum: number;
  closedTime: string;
  endDateIso: string;
  questionID: string;
  resolvedBy: string;
  restricted: boolean;
  rfqEnabled: boolean;
  volume24hr: number;
  volumeClob: number;
  competitive: number;
  conditionId: string;
  description: string;
  clobTokenIds: string;
  liquidityNum: number;
  negRiskOther: boolean;
  orderMinSize: number;
  startDateIso: string;
  submitted_by: string;
  gameStartTime: string;
  liquidityClob: number;
  outcomePrices: string;
  showGmpSeries: boolean;
  umaEndDateIso: string;
  volume1moClob: number;
  volume1wkClob: number;
  volume1yrClob: number;
  customLiveness: number;
  eventStartTime: string;
  groupItemTitle: string;
  lastTradePrice: number;
  readyTimestamp: string;
  rewardsMinSize: number;
  showGmpOutcome: boolean;
  volume24hrClob: number;
  acceptingOrders: boolean;
  enableOrderBook: boolean;
  fundedTimestamp: string;
  clearBookOnStart: boolean;
  hasReviewedDates: boolean;
  manualActivation: boolean;
  negRiskRequestID: string;
  rewardsMaxSpread: number;
  finishedTimestamp: string;
  oneDayPriceChange: number;
  pendingDeployment: boolean;
  deployingTimestamp: string;
  groupItemThreshold: string;
  marketMakerAddress: string;
  oneHourPriceChange: number;
  automaticallyActive: boolean;
  holdingRewardsEnabled: boolean;
  orderPriceMinTickSize: number;
  umaResolutionStatuses: string;
  acceptingOrdersTimestamp: string;
  pagerDutyNotificationEnabled: boolean;
  scheduledDeploymentTimestamp: string;
}

export interface SelectedMarket {
  market: Market;
  liquidity: number;
  big_odd_ask_size: number;
  big_odd_ask_price: number;
  small_odd_ask_size: number;
  small_odd_ask_price: number;
}

export interface MarketConfig {
  market_type: string;
  sl_at_bid_price: number;
  sl_at_ask_prices: number;
  max_entry_seconds: number;
  min_entry_minutes: number;
  max_dollar_value_to_buy: number;
}

export interface OrderbookLevel {
  size: number;
  price: number;
}

export interface TokenOrder {
  side: string;
  price: number;
  amount: number;
  token_id: string;
  order_type: string;
  start_time: number;
  end_time: number;
  error: string;
  is_success: boolean;
}

export interface PostOrdersStats {
  end_time: number;
  start_time: number;
  sucess_positions: number;
  token_to_post_orders: TokenOrder[];
}

export interface SweepStats {
  id: string;
  market: Market;
  end_time: number;
  start_time: number;
  market_config: MarketConfig;
  selected_markets: SelectedMarket[];
  big_odd_ask_order: OrderbookLevel;
  post_orders_stats: PostOrdersStats;
  big_odd_ask_orderbook: OrderbookLevel[];
  small_odd_ask_orderbook: OrderbookLevel[];
}

export interface Sweep {
  id: string;
  market_id: string;
  market_slug: string;
  market_question: string;
  market_start_time: number;
  market_end_time: number;
  market_duration: number;
  is_success: boolean;
  big_odd_ask_size: number;
  big_odd_ask_price: number;
  big_odd_ask_value: number;
  is_market_selected: boolean;
  selected_markets: SelectedMarket[];
  post_order_start_time: string;
  post_order_end_time: string;
  post_order_price: number;
  post_order_size: number;
  post_order_value: number;
  execution_time: number;
  sucess_count: number;
  token_to_post_orders: TokenOrder[];
  stats: SweepStats;
  market_config: MarketConfig;
  big_odd_ask_orderbook: OrderbookLevel[];
  small_odd_ask_orderbook: OrderbookLevel[];
  big_odd_ask_order: OrderbookLevel;
  post_orders_stats: PostOrdersStats;
  created_at: string;
  updated_at: string;
  market: Market;
  updated_market?: Market;
}

export interface SweepsResponse {
  success: boolean;
  data: {
    data: Sweep[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SweepAggregatedData {
  period: string;
  total_sweeps: number;
  total_big_odd_ask_value: number;
  total_post_order_value: number;
  success_rate: number;
  successful_sweeps: number;
  failed_sweeps: number;
  start_time: string;
  end_time: string;
}

export interface AggregatedSweepsResponse {
  success: boolean;
  data: SweepAggregatedData;
}

// API Response wrapper types
export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginationResponse<T> {
  data: T;
  hasMore: boolean;
  limit: number;
  offset: number;
  total: number;
}

// Market types enum
// Reference with the backend market_type
export type MarketType =
  // Crypto markets
  | "crypto_market_15_minutes"
  | "crypto_market_hourly"
  | "crypto_market_one_day"
  | "crypto_market_one_week"
  | "crypto_market_monthly"
  | "crypto_market_yearly"
  | "crypto_market_other"
  // Tech markets
  | "tech_market_one_month"
  | "tech_market_other"
  // Politics markets
  | "politics_market_one_week"
  | "politics_market_one_month"
  | "politics_market_other"
  // Culture markets
  | "culture_market_one_week"
  | "culture_market_other"
  // Other markets
  | "temperature_market_one_day"
  | "earnings_market_one_week"
  | "market_default";

// Filter and sort types
export type SweepSortField = "created_at" | "post_order_value";
export type SortDirection = "asc" | "desc";
export type AggregationPeriod = "1d" | "3d" | "7d" | "1m" | "all";

// Daily metrics types
export interface DailyMetric {
  date: string;
  total_sweeps: number;
  total_sent_value: number;
  max_possible_value: number;
  total_profit: number;
  total_loss: number;
  win_sweeps: number;
  lose_sweeps: number;
  win_rate: number;
}

export interface DailyMetricsResponse {
  success: boolean;
  data: {
    data: DailyMetric[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// User daily metrics types
export interface UserDailyMetric {
  proxyWallet: string;
  date: string;
  totalTrades: number;
  buyTrades: number;
  sellTrades: number;
  totalVolume: number;
  totalValue: number;
  buyVolume: number;
  buyValue: number;
  sellVolume: number;
  sellValue: number;
  averagePrice: number;
  averageBuyPrice: number;
  averageSellPrice: number;
  uniqueMarketsTraded: number;
  uniqueEventsTraded: number;
  totalClosedPositions: number;
  profitablePositions: number;
  losingPositions: number;
  totalProfit: number;
  totalLoss: number;
  largestProfit: number;
  largestLoss: number;
  winRate: number;
}

export interface UserDailyMetricsResponse {
  success: boolean;
  data: {
    data: UserDailyMetric[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
