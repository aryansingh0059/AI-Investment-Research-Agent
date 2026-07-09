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
 * Uses compact summary strings to reduce token usage.
 */
export async function growthAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] growthAnalysis:', state.company);

  try {
    const prompt = buildGrowthPrompt({
      company: state.company,
      companySummary: state.companySummary ?? 'Not available',
      financialSummary: state.financialSummary ?? 'Not available',
      webSummary: state.webSummary ?? 'Not available',
      newsSummary: state.newsSummary ?? 'Not available',
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
      errors: [...state.errors, 'Growth analysis used rule-based fallback'],
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
