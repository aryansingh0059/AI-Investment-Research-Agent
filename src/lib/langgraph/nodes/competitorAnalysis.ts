import type { GraphState } from '../state';
import { getPeers, getCompanyProfile } from '@/lib/services/finnhub';
import type { Competitor } from '@/types/company';

/**
 * Node 5: Competitor Analysis
 * Fetches peer companies and their profiles from Finnhub.
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
    // Take up to 5 peers, exclude the company itself
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

    const profiles = await Promise.all(
      topPeers.map((s) => getCompanyProfile(s))
    );

    const competitors: Competitor[] = topPeers.map((symbol, i) => ({
      symbol,
      name: profiles[i]?.name,
      marketCap: profiles[i]?.marketCap,
      currentPrice: profiles[i]?.currentPrice,
    }));

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
