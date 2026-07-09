import type { GraphState } from '../state';
import { getPeers } from '@/lib/services/finnhub';
import { getQuote, getCompanyProfile } from '@/lib/services/yahooFinanceService';
import type { Competitor } from '@/types/company';
import type { YFQuote } from '@/lib/services/yahooFinanceService';

/**
 * Node 5: Competitor Analysis
 * Uses Finnhub for peer symbol lookup (no Yahoo Finance equivalent).
 * Uses Yahoo Finance for competitor market data.
 */
export async function competitorAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] competitorAnalysis:', state.symbol);

  if (!state.symbol) {
    return {
      errors: [...state.errors, 'Competitor analysis skipped: no symbol'],
    };
  }

  try {
    const peerSymbols = await getPeers(state.symbol);
    const topPeers = peerSymbols
      .filter((s) => s !== state.symbol)
      .slice(0, 5);

    if (topPeers.length === 0) {
      return {
        competitors: [],
        dataQuality: { ...state.dataQuality, hasCompetitors: false },
        errors: [...state.errors],
      };
    }

    // Fetch competitor data from Yahoo Finance in parallel
    const [profileResults, quoteResults] = await Promise.all([
      Promise.all(
        topPeers.map((s) =>
          getCompanyProfile(s).catch(() => ({ symbol: s } as Partial<import('@/types/company').CompanyProfile>))
        )
      ),
      Promise.all(
        topPeers.map((s) =>
          getQuote(s).catch(() => ({ symbol: s } as YFQuote))
        )
      ),
    ]);

    const competitors: Competitor[] = topPeers.map((symbol, i) => {
      const profile = profileResults[i] as Partial<import('@/types/company').CompanyProfile>;
      const quote = quoteResults[i] as YFQuote;
      return {
        symbol,
        name: profile?.name,
        marketCap: quote?.marketCap ?? profile?.marketCap,
        currentPrice: quote?.currentPrice ?? profile?.currentPrice,
        peRatio: quote?.peRatio,
      };
    });

    return {
      competitors,
      dataQuality: { ...state.dataQuality, hasCompetitors: competitors.length > 0 },
      errors: [...state.errors],
    };
  } catch (err) {
    const msg = `Competitor analysis failed: ${String(err)}`;
    console.error('[Node] competitorAnalysis error:', err);
    return { errors: [...state.errors, msg] };
  }
}
