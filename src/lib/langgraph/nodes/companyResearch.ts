import type { GraphState } from '../state';
import { resolveSymbol, getCompanyProfile, getFinancialMetrics } from '@/lib/services/finnhub';
import { getCompanyProfileFromFMP } from '@/lib/services/fmp';
import { generateWithAI } from '@/lib/services/ai';

/**
 * Node 1: Company Research
 * Fetches company profile and resolves the ticker symbol via Finnhub.
 */
export async function companyResearchNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] companyResearch:', state.company);
  const errors: string[] = [];

  try {
    // Resolve ticker symbol
    const symbol = await resolveSymbol(state.company);
    if (!symbol) {
      errors.push(`Could not resolve ticker symbol for "${state.company}"`);
      return { errors: [...state.errors, ...errors] };
    }

    // Fetch profile, metrics and FMP profile in parallel
    const [profile, metrics, fmpProfile] = await Promise.all([
      getCompanyProfile(symbol),
      getFinancialMetrics(symbol),
      getCompanyProfileFromFMP(symbol).catch(() => null),
    ]);

    let ceo = fmpProfile?.ceo ?? profile.ceo;
    if (!ceo) {
      console.log('[Node] companyResearch: API CEO missing, resolving via AI...');
      try {
        const aiResult = await generateWithAI(
          'You are a financial research assistant.',
          `Return ONLY the current CEO name for the company "${profile.name ?? state.company}" (ticker: ${symbol}). Return just the name as a plain string, no other text or formatting. If unknown, return "Unknown".`,
          0.1
        );
        if (aiResult && aiResult.text.trim()) {
          let cleaned = aiResult.text.trim().replace(/^["']|["']$/g, '');
          if (cleaned.startsWith('{')) {
            try {
              const parsed = JSON.parse(cleaned);
              cleaned = parsed.ceo || parsed.ceoName || parsed.name || cleaned;
            } catch {}
          }
          if (cleaned && cleaned.toLowerCase() !== 'unknown') {
            ceo = cleaned;
            console.log(`[Node] companyResearch: Resolved CEO via AI: ${ceo}`);
          }
        }
      } catch (e) {
        console.error('Failed to resolve CEO via AI:', e);
      }
    }

    const companyProfile = {
      ...profile,
      symbol,
      name: profile.name ?? state.company,
      ceo: ceo || undefined,
    };

    return {
      symbol,
      companyProfile,
      dataQuality: {
        ...state.dataQuality,
        hasCompanyProfile: Boolean(profile.name),
      },
      errors: [...state.errors, ...errors],
    };
  } catch (err) {
    const msg = `Company research failed: ${String(err)}`;
    console.error('[Node] companyResearch error:', err);
    return { errors: [...state.errors, msg] };
  }
}
