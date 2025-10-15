/**
 * Trading Configuration
 * 
 */

import { resolveExchangeId, type SupportedExchangeId } from "./exchanges/create-adapter";

export interface TradingConfig {
  symbol: string;
  tradeAmount: number;
  lossLimit: number;
  trailingProfit: number;
  trailingCallbackRate: number;
  profitLockTriggerUsd: number;
  profitLockOffsetUsd: number;
  pollIntervalMs: number;
  maxLogEntries: number;
  klineInterval: string;
  maxCloseSlippagePct: number;
  priceTick: number; // price tick size, e.g. 0.1 for BTCUSDT
  qtyStep: number;   // quantity step size, e.g. 0.001 BTC
  bollingerLength: number;
  bollingerStdMultiplier: number;
  minBollingerBandwidth: number;
}

const SYMBOL_PRIORITY_BY_EXCHANGE: Record<SupportedExchangeId, { envKeys: string[]; fallback: string }> = {
  aster: { envKeys: ["ASTER_SYMBOL", "TRADE_SYMBOL"], fallback: "BTCUSDT" },
  grvt: { envKeys: ["GRVT_SYMBOL", "TRADE_SYMBOL"], fallback: "BTCUSDT" },
  lighter: { envKeys: ["LIGHTER_SYMBOL", "TRADE_SYMBOL"], fallback: "BTCUSDT" },
  backpack: { envKeys: ["BACKPACK_SYMBOL", "TRADE_SYMBOL"], fallback: "BTCUSDC" },
  paradex: { envKeys: ["PARADEX_SYMBOL", "TRADE_SYMBOL"], fallback: "BTC/USDC" },
};

export function resolveSymbolFromEnv(explicitExchangeId?: SupportedExchangeId | string | null): string {
  const exchangeId = explicitExchangeId
    ? resolveExchangeId(explicitExchangeId)
    : resolveExchangeId();
  const { envKeys, fallback } = SYMBOL_PRIORITY_BY_EXCHANGE[exchangeId];
  for (const key of envKeys) {
    const value = process.env[key];
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return fallback;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return fallback;
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") return true;
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") return false;
  return fallback;
}

export const tradingConfig: TradingConfig = {
  symbol: resolveSymbolFromEnv(),
  tradeAmount: parseNumber(process.env.TRADE_AMOUNT, 0.001),
  lossLimit: parseNumber(process.env.LOSS_LIMIT, 0.03),
  trailingProfit: parseNumber(process.env.TRAILING_PROFIT, 0.2),
  trailingCallbackRate: parseNumber(process.env.TRAILING_CALLBACK_RATE, 0.2),
  profitLockTriggerUsd: parseNumber(process.env.PROFIT_LOCK_TRIGGER_USD, 0.1),
  profitLockOffsetUsd: parseNumber(process.env.PROFIT_LOCK_OFFSET_USD, 0.05),
  pollIntervalMs: parseNumber(process.env.POLL_INTERVAL_MS, 500),
  maxLogEntries: parseNumber(process.env.MAX_LOG_ENTRIES, 200),
  klineInterval: process.env.KLINE_INTERVAL ?? "1m",
  maxCloseSlippagePct: parseNumber(process.env.MAX_CLOSE_SLIPPAGE_PCT, 0.05),
  priceTick: parseNumber(process.env.PRICE_TICK, 0.1),
  qtyStep: parseNumber(process.env.QTY_STEP, 0.001),
  bollingerLength: parseNumber(process.env.BOLLINGER_LENGTH, 20),
  bollingerStdMultiplier: parseNumber(process.env.BOLLINGER_STD_MULTIPLIER, 2),
  minBollingerBandwidth: parseNumber(process.env.MIN_BOLLINGER_BANDWIDTH, 0.001),
};

export interface MakerConfig {
  symbol: string;
  tradeAmount: number;
  lossLimit: number;
  bidOffset: number;
  askOffset: number;
  refreshIntervalMs: number;
  maxLogEntries: number;
  maxCloseSlippagePct: number;
  priceTick: number;
}

export const makerConfig: MakerConfig = {
  // 交易对符号，如 BTCUSDT、ETHUSDT
  symbol: process.env.TRADE_SYMBOL ?? "BTCUSDT",
  // 每次交易的数量（单位：基础货币，如 BTC）
  tradeAmount: parseNumber(process.env.TRADE_AMOUNT, 0.001),
  // 止损限制，当亏损达到此百分比时停止交易
  lossLimit: parseNumber(process.env.MAKER_LOSS_LIMIT, parseNumber(process.env.LOSS_LIMIT, 0.03)),
  // 价格追逐阈值，当价格变动超过此百分比时重新挂单
  priceChaseThreshold: parseNumber(process.env.MAKER_PRICE_CHASE, 0.3),
  // 买单偏移量，相对于中间价的偏移百分比（可为负值）
  bidOffset: parseNumber(process.env.MAKER_BID_OFFSET, 0),
  // 卖单偏移量，相对于中间价的偏移百分比（可为负值）
  askOffset: parseNumber(process.env.MAKER_ASK_OFFSET, 0),
  // 刷新间隔（毫秒），控制挂单更新的频率
  refreshIntervalMs: parseNumber(process.env.MAKER_REFRESH_INTERVAL_MS, 1500),
  // 最大日志条目数，限制内存中的日志数量
  maxLogEntries: parseNumber(process.env.MAKER_MAX_LOG_ENTRIES, 200),
  // 最大平仓滑点百分比，平仓时允许的价格偏差
  maxCloseSlippagePct: parseNumber(
    process.env.MAKER_MAX_CLOSE_SLIPPAGE_PCT ?? process.env.MAX_CLOSE_SLIPPAGE_PCT,
    0.05
  ),
  // 价格最小变动单位（tick size），如 BTCUSDT 为 0.1
  priceTick: parseNumber(process.env.MAKER_PRICE_TICK ?? process.env.PRICE_TICK, 0.1),
};
