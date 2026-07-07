import type { GraphState } from '../state';
import { generateWithAI } from '@/lib/services/ai';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';
import { buildSWOTPrompt } from '@/lib/prompts/swotPrompt';
import type { SWOTAnalysis } from '@/types/recommendation';

function buildFallbackSWOT(state: GraphState): SWOTAnalysis {
  const { companyProfile, financialData } = state;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  if (companyProfile?.marketCap && companyProfile.marketCap > 1e11) {
    strengths.push('Large market capitalization indicating significant scale and stability');
  }
  if (financialData?.metrics?.netMargin && financialData.metrics.netMargin > 0.15) {
    strengths.push(`Strong net profit margin of ${(financialData.metrics.netMargin * 100).toFixed(1)}%`);
  }
  if (financialData?.metrics?.roe && financialData.metrics.roe > 0.15) {
    strengths.push(`High return on equity of ${(financialData.metrics.roe * 100).toFixed(1)}%`);
  }
  if (financialData?.totalDebt && financialData.cash && financialData.totalDebt > financialData.cash * 2) {
    weaknesses.push('Elevated debt levels relative to cash position');
  }
  if (financialData?.metrics?.revenueGrowthYoy != null && financialData.metrics.revenueGrowthYoy < 0.03) {
    weaknesses.push('Slow revenue growth may indicate market saturation or competitive pressure');
  }

  // Generic SWOT if insufficient data
  if (strengths.length === 0) strengths.push('Established market presence and brand recognition');
  if (weaknesses.length === 0) weaknesses.push('Insufficient data to assess specific weaknesses');
  opportunities.push('Digital transformation and AI adoption opportunities');
  opportunities.push('Potential for geographic expansion into emerging markets');
  threats.push('Macroeconomic uncertainty and interest rate risk');
  threats.push('Increasing competition from both established players and disruptors');

  return { strengths, weaknesses, opportunities, threats };
}

/**
 * Node 8: SWOT Generator
 * Uses AI to generate a comprehensive SWOT analysis.
 */
export async function swotGeneratorNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] swotGenerator:', state.company);

  try {
    const profile = state.companyProfile
      ? JSON.stringify({
          symbol: state.companyProfile.symbol,
          name: state.companyProfile.name,
          industry: state.companyProfile.industry,
          marketCap: state.companyProfile.marketCap,
        }, null, 2)
      : 'Not available';

    const financials = state.financialData
      ? JSON.stringify({
          latestRevenue: state.financialData.latestRevenue,
          latestNetIncome: state.financialData.latestNetIncome,
          metrics: state.financialData.metrics,
        }, null, 2)
      : 'Not available';

    const news = state.news.length > 0
      ? state.news.slice(0, 3).map((n) => `• ${n.title} (${n.sentiment})`).join('\n')
      : 'Not available';

    const webInsights = state.webInsights.length > 0
      ? state.webInsights.slice(0, 3).map((w) => `• ${w.title}: ${w.content.slice(0, 120)}`).join('\n')
      : 'Not available';

    const competitors = state.competitors.length > 0
      ? state.competitors.slice(0, 3).map((c) => `${c.symbol}`).join(', ')
      : 'Not available';

    const prompt = buildSWOTPrompt({
      company: state.company,
      profile,
      financials,
      news,
      webInsights,
      competitors,
    });

    const aiResult = await generateWithAI(SYSTEM_PROMPT, prompt);
    if (aiResult) {
      const parsed = JSON.parse(aiResult.text);
      if (parsed.strengths && parsed.weaknesses && parsed.opportunities && parsed.threats) {
        console.log(`[Node] swotGenerator: used ${aiResult.provider}`);
        return { swot: parsed as SWOTAnalysis, errors: [...state.errors] };
      }
    }

    return {
      swot: buildFallbackSWOT(state),
      errors: [...state.errors, 'SWOT used rule-based fallback (Gemini and Groq both unavailable)'],
    };
  } catch (err) {
    const msg = `SWOT generation failed: ${String(err)}`;
    console.error('[Node] swotGenerator error:', err);
    return {
      swot: buildFallbackSWOT(state),
      errors: [...state.errors, msg],
    };
  }
}
