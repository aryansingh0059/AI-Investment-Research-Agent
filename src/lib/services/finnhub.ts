/**
 * Finnhub API service
 * Docs: https://finnhub.io/docs/api
 *
 * Retained only for:
 *  - getPeers()     → competitor symbol lookup (no Yahoo Finance equivalent)
 *  - getCompanyLogo() → company logo URL (Yahoo Finance doesn't provide logos)
 *  - resolveSymbol() → fallback ticker search if Yahoo Finance search fails
 */
import { FINNHUB_BASE, REQUEST_TIMEOUT } from '@/constants';

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

/** Fallback: resolve ticker symbol from company name via Finnhub */
export async function resolveSymbolFallback(company: string): Promise<string | null> {
  const data = await finnhubFetch<{ result?: Array<{ symbol: string; description: string; type: string }> }>(
    `/search?q=${encodeURIComponent(company)}`
  );
  if (!data?.result?.length) return null;
  const stock = data.result.find((r) => r.type === 'Common Stock') ?? data.result[0];
  return stock?.symbol ?? null;
}

interface FinnhubProfile {
  logo?: string;
  exchange?: string;
}

/** Get logo URL and exchange from Finnhub (supplements Yahoo Finance profile) */
export async function getCompanyLogo(symbol: string): Promise<{ logo?: string; exchange?: string }> {
  const profile = await finnhubFetch<FinnhubProfile>(`/stock/profile2?symbol=${symbol}`);
  return {
    logo: profile?.logo ?? undefined,
    exchange: profile?.exchange ?? undefined,
  };
}

/** Get peer company symbols for competitor analysis */
export async function getPeers(symbol: string): Promise<string[]> {
  const data = await finnhubFetch<string[]>(`/stock/peers?symbol=${symbol}`);
  return data ?? [];
}
