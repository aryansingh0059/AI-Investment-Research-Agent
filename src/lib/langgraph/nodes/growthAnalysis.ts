import type { GraphState } from '../state';
import { generateWithAI } from '@/lib/services/ai';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';
import { buildGrowthPrompt } from '@/lib/prompts/growthPrompt';
import type { GrowthFactor } from '@/types/recommendation';

function buildFallbackGrowth(state: GraphState): GrowthFactor[] {
  const factors: GrowthFactor[] = [];
  const { financialData } = state;

  if (financialData?.metrics?.revenueGrowthYoy != null) {
    const growth = financialData.metrics.revenueGrowthYoy;
    factors.push({
      category: 'Revenue Growth',
      description: `Year-over-year revenue growth of ${(growth * 100).toFixed(1)}%.`,
      impact: growth > 0.15 ? 'high' : growth > 0.05 ? 'medium' : 'low',
    });
  }

  factors.push({
    category: 'Innovation',
    description: 'Growth in innovation and technology adoption is expected based on sector trends.',
    impact: 'medium',
  });

  factors.push({
    category: 'Market Expansion',
    description: 'Potential for geographic and market segment expansion.',
    impact: 'medium',
  });

  return factors;
}

/**
 * Node 7: Growth Analysis
 * Uses AI to identify growth catalysts and opportunities.
 */
export async function growthAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] growthAnalysis:', state.company);

  try {
    const profile = state.companyProfile
      ? JSON.stringify({
          symbol: state.companyProfile.symbol,
          name: state.companyProfile.name,
          industry: state.companyProfile.industry,
        }, null, 2)
      : 'Not available';

    const financials = state.financialData
      ? JSON.stringify({
          latestRevenue: state.financialData.latestRevenue,
          metrics: state.financialData.metrics,
        }, null, 2)
      : 'Not available';

    const webInsights = state.webInsights.length > 0
      ? state.webInsights.slice(0, 3).map((w) => `• ${w.title}: ${w.content.slice(0, 120)}`).join('\n')
      : 'Not available';

    const news = state.news.length > 0
      ? state.news.slice(0, 3).map((n) => `• ${n.title}`).join('\n')
      : 'Not available';

    const prompt = buildGrowthPrompt({
      company: state.company,
      profile,
      financials,
      webInsights,
      news,
    });

    const aiResult = await generateWithAI(SYSTEM_PROMPT, prompt);
    if (aiResult) {
      const parsed = JSON.parse(aiResult.text);
      if (Array.isArray(parsed.growthFactors)) {
        console.log(`[Node] growthAnalysis: used ${aiResult.provider}`);
        return { growthFactors: parsed.growthFactors as GrowthFactor[], errors: [...state.errors] };
      }
    }

    return {
      growthFactors: buildFallbackGrowth(state),
      errors: [...state.errors, 'Growth analysis used rule-based fallback (Gemini and Groq both unavailable)'],
    };
  } catch (err) {
    const msg = `Growth analysis failed: ${String(err)}`;
    console.error('[Node] growthAnalysis error:', err);
    return {
      growthFactors: buildFallbackGrowth(state),
      errors: [...state.errors, msg],
    };
  }
}
