/**
 * Finnhub API service
 * Docs: https://finnhub.io/docs/api
 */
import { FINNHUB_BASE, REQUEST_TIMEOUT } from '@/constants';
import type { CompanyProfile, Competitor } from '@/types';
import type { FinancialMetrics } from '@/types/financial';

async function finnhubFetch<T>(path: string): Promise<T | null> {
  const apiKey = process.env.FINNHUB_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[Finnhub] API key not configured');
    return null;
  }
  try {
    const url = `${FINNHUB_BASE}${path}&token=${apiKey}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.warn(`[Finnhub] ${path} returned ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[Finnhub] Error fetching ${path}:`, err);
    return null;
  }
}

/** Resolve ticker symbol from company name */
export async function resolveSymbol(company: string): Promise<string | null> {
  const data = await finnhubFetch<{ result?: Array<{ symbol: string; description: string; type: string }> }>(
    `/search?q=${encodeURIComponent(company)}`
  );
  if (!data?.result?.length) return null;
  // Prefer US-listed common stocks
  const stock = data.result.find((r) => r.type === 'Common Stock') ?? data.result[0];
  return stock?.symbol ?? null;
}

interface FinnhubProfile {
  name?: string;
  logo?: string;
  finnhubIndustry?: string;
  weburl?: string;
  country?: string;
  currency?: string;
  exchange?: string;
  ipo?: string;
  marketCapitalization?: number;
  shareOutstanding?: number;
}

interface FinnhubQuote {
  c?: number;  // current price
  h?: number;  // high
  l?: number;  // low
  o?: number;  // open
  pc?: number; // previous close
}

export async function getCompanyProfile(symbol: string): Promise<Partial<CompanyProfile>> {
  const [profile, quote] = await Promise.all([
    finnhubFetch<FinnhubProfile>(`/stock/profile2?symbol=${symbol}`),
    finnhubFetch<FinnhubQuote>(`/quote?symbol=${symbol}`),
  ]);

  return {
    symbol,
    name: profile?.name,
    logo: profile?.logo,
    industry: profile?.finnhubIndustry,
    finnhubIndustry: profile?.finnhubIndustry,
    website: profile?.weburl,
    country: profile?.country,
    currency: profile?.currency,
    exchange: profile?.exchange,
    ipo: profile?.ipo,
    marketCap: profile?.marketCapitalization
      ? profile.marketCapitalization * 1e6
      : undefined,
    currentPrice: quote?.c,
  };
}

export async function getFinancialMetrics(symbol: string): Promise<Partial<FinancialMetrics>> {
  const data = await finnhubFetch<{ metric?: Record<string, number> }>(
    `/stock/metric?symbol=${symbol}&metric=all`
  );
  const m = data?.metric ?? {};
  return {
    peRatio: m['peBasicExclExtraTTM'],
    pbRatio: m['pbQuarterly'],
    revenueGrowthYoy: m['revenueGrowthTTMYoy'] ? m['revenueGrowthTTMYoy'] / 100 : undefined,
    earningsGrowthYoy: m['epsGrowthTTMYoy'] ? m['epsGrowthTTMYoy'] / 100 : undefined,
    roe: m['roeRfy'] ? m['roeRfy'] / 100 : undefined,
    roa: m['roaRfy'] ? m['roaRfy'] / 100 : undefined,
    operatingMargin: m['operatingMarginTTM'] ? m['operatingMarginTTM'] / 100 : undefined,
    netMargin: m['netProfitMarginTTM'] ? m['netProfitMarginTTM'] / 100 : undefined,
    dividendYield: m['dividendYieldIndicatedAnnual'] ? m['dividendYieldIndicatedAnnual'] / 100 : undefined,
    beta: m['beta'],
    week52High: m['52WeekHigh'],
    week52Low: m['52WeekLow'],
    currentRatio: m['currentRatioQuarterly'],
    debtToEquity: m['totalDebt/totalEquityQuarterly'],
  };
}

export async function getPeers(symbol: string): Promise<string[]> {
  const data = await finnhubFetch<string[]>(`/stock/peers?symbol=${symbol}`);
  return data ?? [];
}
