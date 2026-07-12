/**
 * Yahoo Finance service — replaces Financial Modeling Prep (FMP)
 * Uses yahoo-finance2 v3 npm package (no API key required).
 *
 * yahoo-finance2 v3 BREAKING CHANGES from v2:
 * - Must use `new YahooFinance()` constructor (not default singleton)
 * - Financial statements moved from quoteSummary to fundamentalsTimeSeries
 * - quoteSummary modules still available for profile, price, financialData
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — yahoo-finance2 v3 uses default class export
import YahooFinance from 'yahoo-finance2';
import type { CompanyProfile } from '@/types/company';
import type {
  FinancialData,
  FinancialMetrics,
  IncomeStatement,
  BalanceSheet,
  CashFlow,
} from '@/types/financial';

// ─── Singleton instance ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yf: any = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey'] });

// ─── Request-level in-memory cache ─────────────────────────────────────────
// Keyed by `symbol:method` — avoids duplicate YF requests within one analysis run
const _cache = new Map<string, unknown>();

function fromCache<T>(key: string): T | undefined {
  return _cache.get(key) as T | undefined;
}

function toCache<T>(key: string, value: T): T {
  _cache.set(key, value);
  return value;
}

/** Safe number coerce — returns undefined for NaN/null/undefined */
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Four years ago from today as ISO date string */
function fourYearsAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5); // 5 to ensure we capture 4 full fiscal years
  return d.toISOString().split('T')[0];
}

// ─── Symbol resolution ───────────────────────────────────────────────────────

/**
 * Resolve a company name or partial ticker to the best matching Yahoo Finance symbol.
 */
export async function resolveSymbol(company: string): Promise<string | null> {
  const cacheKey = `resolve:${company.toLowerCase()}`;
  const cached = fromCache<string | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any = await yf.search(company, {
      newsCount: 0,
      quotesCount: 6,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quotes: any[] = results?.quotes ?? [];
    const equity =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quotes.find((q: any) =>
        q.typeDisp === 'Equity' &&
        q.exchange &&
        ['NMS', 'NYQ', 'NGM', 'ASE', 'NSI', 'BSE'].includes(q.exchange)
      ) ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quotes.find((q: any) => q.typeDisp === 'Equity') ??
      quotes[0];

    const symbol = equity?.symbol ?? null;
    return toCache(cacheKey, symbol);
  } catch (err) {
    // Re-throw network/SSL errors so callers (e.g. companyValidatorNode)
    // can distinguish between "not found" (null) and "network failure" (throw).
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const isNetwork =
      msg.includes('fetch failed') ||
      msg.includes('certificate') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('etimedout');
    if (isNetwork) throw err;
    console.error('[YahooFinance] resolveSymbol error:', err);
    return toCache(cacheKey, null);
  }
}

// ─── Company profile ─────────────────────────────────────────────────────────

/**
 * Get company profile from Yahoo Finance quoteSummary.
 * Returns name, sector, industry, website, employees, description, location, price, marketCap.
 */
export async function getCompanyProfile(
  symbol: string
): Promise<Partial<CompanyProfile>> {
  const cacheKey = `profile:${symbol}`;
  const cached = fromCache<Partial<CompanyProfile>>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const summary: any = await yf.quoteSummary(symbol, {
      modules: ['assetProfile', 'summaryDetail', 'price'],
    });

    const asset = summary?.assetProfile;
    const price = summary?.price;

    const profile: Partial<CompanyProfile> = {
      symbol,
      name: price?.shortName ?? price?.longName ?? undefined,
      industry: asset?.industry ?? undefined,
      sector: asset?.sector ?? undefined,
      website: asset?.website ?? undefined,
      employees: num(asset?.fullTimeEmployees),
      description: asset?.longBusinessSummary ?? undefined,
      headquarters: asset?.city
        ? `${asset.city}${asset.country ? `, ${asset.country}` : ''}`
        : (asset?.country ?? undefined),
      country: asset?.country ?? undefined,
      currentPrice: num(price?.regularMarketPrice),
      marketCap: num(price?.marketCap),
      currency: price?.currency || (symbol.toUpperCase().endsWith('.NS') || symbol.toUpperCase().endsWith('.BO') ? 'INR' : 'USD'),
      exchange: price?.exchangeName ?? undefined,
    };

    return toCache(cacheKey, profile);
  } catch (err) {
    console.error(`[YahooFinance] getCompanyProfile(${symbol}) error:`, err);
    return toCache(cacheKey, { symbol });
  }
}

// ─── Quote ───────────────────────────────────────────────────────────────────

export interface YFQuote {
  symbol: string;
  currentPrice?: number;
  marketCap?: number;
  peRatio?: number;
  beta?: number;
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
  eps?: number;
}

/**
 * Get real-time quote data for a symbol.
 */
export async function getQuote(symbol: string): Promise<YFQuote> {
  const cacheKey = `quote:${symbol}`;
  const cached = fromCache<YFQuote>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = await yf.quote(symbol);
    const result: YFQuote = {
      symbol,
      currentPrice: num(q?.regularMarketPrice),
      marketCap: num(q?.marketCap),
      peRatio: num(q?.trailingPE),
      beta: num(q?.beta),
      dividendYield: num(q?.dividendYield),
      week52High: num(q?.fiftyTwoWeekHigh),
      week52Low: num(q?.fiftyTwoWeekLow),
      eps: num(q?.epsTrailingTwelveMonths),
    };
    return toCache(cacheKey, result);
  } catch (err) {
    console.error(`[YahooFinance] getQuote(${symbol}) error:`, err);
    return toCache(cacheKey, { symbol });
  }
}

// ─── Financial statements ────────────────────────────────────────────────────

/**
 * Fetch the latest 4 fiscal years of financial statements using fundamentalsTimeSeries.
 * This is the correct v3 API — quoteSummary no longer returns full statements.
 */
export async function getFinancialData(symbol: string): Promise<FinancialData | null> {
  const cacheKey = `financials:${symbol}`;
  const cached = fromCache<FinancialData | null>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // Fetch all financial data + metrics in parallel
    const [allSeriesRaw, financialDataRaw, keyStatsRaw] = await Promise.all([
      // fundamentalsTimeSeries 'all' module gives income + balance + cashflow in one call
      yf.fundamentalsTimeSeries(symbol, {
        period1: fourYearsAgo(),
        type: 'annual',
        module: 'all',
      }).catch((e: unknown) => {
        console.warn(`[YahooFinance] fundamentalsTimeSeries failed for ${symbol}:`, e);
        return [];
      }),
      yf.quoteSummary(symbol, { modules: ['financialData'] }).catch(() => null),
      yf.quoteSummary(symbol, { modules: ['defaultKeyStatistics'] }).catch(() => null),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const series: any[] = Array.isArray(allSeriesRaw) ? allSeriesRaw : [];

    // Sort by date chronologically and take latest 4 annual periods
    const sorted = series
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((s: any) => s.date)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-4);

    // ── Income statements ────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const incomeStatements: IncomeStatement[] = sorted.map((s: any) => ({
      date: s.date instanceof Date
        ? s.date.toISOString().split('T')[0]
        : String(s.date).split('T')[0],
      revenue: num(s.totalRevenue) ?? 0,
      netIncome: num(s.netIncome) ?? 0,
      grossProfit: num(s.grossProfit) ?? 0,
      operatingIncome: num(s.operatingIncome) ?? 0,
      eps: num(s.dilutedEPS ?? s.basicEPS) ?? 0,
      ebitda: num(s.EBITDA) ?? 0,
    })).filter((s: IncomeStatement) => s.revenue !== 0 || s.netIncome !== 0);

    // ── Balance sheets ───────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const balanceSheets: BalanceSheet[] = sorted.map((s: any) => {
      const totalDebt = num(s.totalDebt) ?? 0;
      const longTermDebt = num(s.longTermDebt) ?? 0;
      const currentDebt = num(s.currentDebt) ?? 0;
      const cash = num(s.cashAndCashEquivalents ?? s.cashCashEquivalentsAndShortTermInvestments) ?? 0;
      const totalAssets = num(s.totalAssets) ?? 0;
      const totalLiab = num(s.totalLiabilitiesNetMinorityInterest) ?? 0;
      const equity = num(s.stockholdersEquity ?? s.commonStockEquity) ?? (totalAssets - totalLiab);

      return {
        date: s.date instanceof Date
          ? s.date.toISOString().split('T')[0]
          : String(s.date).split('T')[0],
        totalAssets,
        totalLiabilities: totalLiab,
        totalEquity: equity,
        cash,
        totalDebt: totalDebt || (longTermDebt + currentDebt),
        shortTermDebt: currentDebt,
        longTermDebt,
      };
    }).filter((s: BalanceSheet) => s.totalAssets !== 0);

    // ── Cash flow statements ─────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cashFlows: CashFlow[] = sorted.map((s: any) => {
      const operatingCF = num(s.operatingCashFlow) ?? 0;
      const freeCF = num(s.freeCashFlow) ?? 0;
      const capEx = num(s.capitalExpenditure) ?? 0;

      return {
        date: s.date instanceof Date
          ? s.date.toISOString().split('T')[0]
          : String(s.date).split('T')[0],
        operatingCashFlow: operatingCF,
        freeCashFlow: freeCF || (operatingCF + capEx), // capEx is negative in YF
        capitalExpenditure: capEx,
        dividendsPaid: num(s.cashDividendsPaid ?? s.commonStockDividendPaid),
      };
    }).filter((s: CashFlow) => s.operatingCashFlow !== 0);

    // ── Metrics from financialData + defaultKeyStatistics ───────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fd: any = financialDataRaw?.financialData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ks: any = keyStatsRaw?.defaultKeyStatistics;

    const metrics: FinancialMetrics = {
      peRatio: num(ks?.forwardPE ?? ks?.trailingPE),
      pbRatio: num(ks?.priceToBook),
      debtToEquity: num(fd?.debtToEquity != null ? (fd.debtToEquity as number) / 100 : undefined),
      currentRatio: num(fd?.currentRatio),
      roe: num(fd?.returnOnEquity),
      roa: num(fd?.returnOnAssets),
      operatingMargin: num(fd?.operatingMargins),
      netMargin: num(fd?.profitMargins),
      grossMargin: num(fd?.grossMargins),
      dividendYield: num(ks?.yield),
      beta: num(ks?.beta),
      week52High: num(ks?.fiftyTwoWeekHigh),
      week52Low: num(ks?.fiftyTwoWeekLow),
    };

    // Calculate revenue growth YoY from statements
    if (incomeStatements.length >= 2) {
      const latest = incomeStatements[incomeStatements.length - 1];
      const prev = incomeStatements[incomeStatements.length - 2];
      if (prev.revenue && prev.revenue !== 0) {
        metrics.revenueGrowthYoy = (latest.revenue - prev.revenue) / Math.abs(prev.revenue);
      }
    }

    // Calculate EPS growth YoY
    if (incomeStatements.length >= 2) {
      const latest = incomeStatements[incomeStatements.length - 1];
      const prev = incomeStatements[incomeStatements.length - 2];
      if (prev.eps && prev.eps !== 0) {
        metrics.earningsGrowthYoy = (latest.eps - prev.eps) / Math.abs(prev.eps);
      }
    }

    const latestInc = incomeStatements[incomeStatements.length - 1];
    const latestBal = balanceSheets[balanceSheets.length - 1];
    const latestCF = cashFlows[cashFlows.length - 1];

    const result: FinancialData = {
      incomeStatements,
      balanceSheets,
      cashFlows,
      metrics,
      latestRevenue: latestInc?.revenue,
      latestNetIncome: latestInc?.netIncome,
      latestEPS: (latestInc?.eps !== 0 ? latestInc?.eps : undefined) ?? num(ks?.trailingEps),
      latestFreeCashFlow: latestCF?.freeCashFlow,
      totalDebt: latestBal?.totalDebt,
      cash: latestBal?.cash,
    };

    return toCache(cacheKey, result);
  } catch (err) {
    console.error(`[YahooFinance] getFinancialData(${symbol}) error:`, err);
    return toCache(cacheKey, null);
  }
}

// ─── Company validation ───────────────────────────────────────────────────────

export interface CompanyValidationResult {
  valid: boolean;
  /** Why validation failed — only set when valid === false */
  reason?: string;
  /** Resolved company name from Yahoo Finance */
  name?: string;
  /** Exchange name (e.g. "NasdaqGS", "NYSE") */
  exchange?: string;
  /** Yahoo Finance quoteType (e.g. "EQUITY", "ETF", "CRYPTOCURRENCY") */
  quoteType?: string;
}

/**
 * Validates that a resolved ticker symbol corresponds to a real, publicly listed equity.
 *
 * Rules:
 *  - quoteType must be "EQUITY" (rejects ETFs, crypto, mutual funds, indices)
 *  - shortName or longName must be present
 *  - exchangeName must be present
 */
export async function validateCompany(symbol: string): Promise<CompanyValidationResult> {
  const cacheKey = `validate:${symbol}`;
  const cached = fromCache<CompanyValidationResult>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const q: any = await yf.quote(symbol);

    if (!q) {
      return toCache(cacheKey, { valid: false, reason: 'No data returned from Yahoo Finance.' });
    }

    const quoteType: string = q.quoteType ?? '';
    const name: string = q.shortName ?? q.longName ?? '';
    const exchange: string = q.fullExchangeName ?? q.exchange ?? '';

    if (quoteType !== 'EQUITY') {
      return toCache(cacheKey, {
        valid: false,
        reason: `Security type "${quoteType || 'unknown'}" is not a publicly listed company equity.`,
        quoteType,
        name,
        exchange,
      });
    }

    if (!name) {
      return toCache(cacheKey, {
        valid: false,
        reason: 'Company name could not be determined.',
        quoteType,
        exchange,
      });
    }

    if (!exchange) {
      return toCache(cacheKey, {
        valid: false,
        reason: 'Exchange information is missing — may not be a listed security.',
        quoteType,
        name,
      });
    }

    return toCache(cacheKey, { valid: true, name, exchange, quoteType });
  } catch (err) {
    // Re-throw network/SSL errors so companyValidatorNode can distinguish
    // infrastructure failures from definitive 'not found' results.
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const isNetwork =
      msg.includes('fetch failed') ||
      msg.includes('certificate') ||
      msg.includes('econnrefused') ||
      msg.includes('enotfound') ||
      msg.includes('etimedout');
    if (isNetwork) throw err;
    console.error(`[YahooFinance] validateCompany(${symbol}) error:`, err);
    return toCache(cacheKey, { valid: false, reason: 'Failed to fetch company data from Yahoo Finance.' });
  }
}

// ─── Financial metrics only ───────────────────────────────────────────────────

/**
 * Get financial ratios and metrics for a symbol.
 */
export async function getFinancialMetrics(symbol: string): Promise<Partial<FinancialMetrics>> {
  const cacheKey = `metrics:${symbol}`;
  const cached = fromCache<Partial<FinancialMetrics>>(cacheKey);
  if (cached !== undefined) return cached;

  try {
    const [fdRaw, ksRaw, quoteRaw] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yf.quoteSummary(symbol, { modules: ['financialData'] }).catch(() => null) as Promise<any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yf.quoteSummary(symbol, { modules: ['defaultKeyStatistics'] }).catch(() => null) as Promise<any>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      yf.quote(symbol).catch(() => null) as Promise<any>,
    ]);

    const fd = fdRaw?.financialData;
    const ks = ksRaw?.defaultKeyStatistics;

    const metrics: Partial<FinancialMetrics> = {
      peRatio: num(quoteRaw?.trailingPE),
      pbRatio: num(ks?.priceToBook),
      debtToEquity: num(fd?.debtToEquity != null ? (fd.debtToEquity as number) / 100 : undefined),
      currentRatio: num(fd?.currentRatio),
      roe: num(fd?.returnOnEquity),
      roa: num(fd?.returnOnAssets),
      operatingMargin: num(fd?.operatingMargins),
      netMargin: num(fd?.profitMargins),
      grossMargin: num(fd?.grossMargins),
      dividendYield: num(quoteRaw?.dividendYield),
      beta: num(quoteRaw?.beta),
      week52High: num(quoteRaw?.fiftyTwoWeekHigh),
      week52Low: num(quoteRaw?.fiftyTwoWeekLow),
    };

    return toCache(cacheKey, metrics);
  } catch (err) {
    console.error(`[YahooFinance] getFinancialMetrics(${symbol}) error:`, err);
    return toCache(cacheKey, {});
  }
}
