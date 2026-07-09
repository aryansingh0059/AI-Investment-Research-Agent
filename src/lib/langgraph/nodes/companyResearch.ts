import type { GraphState } from '../state';
import {
  resolveSymbol,
  getCompanyProfile,
  getQuote,
} from '@/lib/services/yahooFinanceService';
import { resolveSymbolFallback, getCompanyLogo } from '@/lib/services/finnhub';
import { generateWithAI } from '@/lib/services/ai';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { cleanAndParseJSON } from '@/lib/utils/json';

/**
 * Node 1: Company Research
 * Fetches company profile via Yahoo Finance; uses Finnhub for logo + fallback symbol resolution.
 * Produces `companySummary` for downstream AI nodes.
 */
export async function companyResearchNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] companyResearch:', state.company);
  const errors: string[] = [];

  try {
    // ── Resolve symbol ───────────────────────────────────────────────────────
    let symbol = await resolveSymbol(state.company);
    if (!symbol) {
      console.log('[Node] companyResearch: Yahoo Finance symbol lookup failed — trying Finnhub fallback');
      symbol = await resolveSymbolFallback(state.company);
    }
    if (!symbol) {
      errors.push(`Could not resolve ticker symbol for "${state.company}"`);
      return { errors: [...state.errors, ...errors] };
    }

    // ── Fetch profile, quote, and logo in parallel ───────────────────────────
    const [yfProfile, yfQuote, finnhubLogoDataRaw] = await Promise.all([
      getCompanyProfile(symbol),
      getQuote(symbol),
      getCompanyLogo(symbol).catch(() => ({ logo: undefined, exchange: undefined })),
    ]);
    const finnhubLogoData: { logo?: string; exchange?: string } = finnhubLogoDataRaw;

    const ceo: string | undefined = undefined;

    const companyProfile = {
      ...yfProfile,
      symbol,
      name: yfProfile.name ?? state.company,
      logo: finnhubLogoData.logo ?? yfProfile.logo,
      exchange: finnhubLogoData.exchange ?? yfProfile.exchange,
      currentPrice: yfQuote.currentPrice ?? yfProfile.currentPrice,
      marketCap: yfQuote.marketCap ?? yfProfile.marketCap,
      ceo,
    };

    // ── Build compact companySummary for AI prompts ──────────────────────────
    const companySummary = [
      `Company: ${companyProfile.name} (${symbol})`,
      companyProfile.sector ? `Sector: ${companyProfile.sector}` : '',
      companyProfile.industry ? `Industry: ${companyProfile.industry}` : '',
      companyProfile.currentPrice ? `Price: $${companyProfile.currentPrice.toFixed(2)}` : '',
      companyProfile.marketCap ? `Market Cap: ${formatCurrency(companyProfile.marketCap)}` : '',
      companyProfile.employees ? `Employees: ${companyProfile.employees.toLocaleString()}` : '',
      companyProfile.country ? `Country: ${companyProfile.country}` : '',
      yfQuote.peRatio ? `P/E: ${yfQuote.peRatio.toFixed(1)}` : '',
      yfQuote.beta ? `Beta: ${yfQuote.beta.toFixed(2)}` : '',
      yfQuote.week52High ? `52W High: $${yfQuote.week52High.toFixed(2)}` : '',
      yfQuote.week52Low ? `52W Low: $${yfQuote.week52Low.toFixed(2)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    return {
      symbol,
      companyProfile,
      companySummary,
      dataQuality: {
        ...state.dataQuality,
        hasCompanyProfile: Boolean(yfProfile.name),
      },
      errors: [...state.errors, ...errors],
    };
  } catch (err) {
    const msg = `Company research failed: ${String(err)}`;
    console.error('[Node] companyResearch error:', err);
    return { errors: [...state.errors, msg] };
  }
}
