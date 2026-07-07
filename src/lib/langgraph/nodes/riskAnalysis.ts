import type { GraphState } from '../state';
import { generateWithAI } from '@/lib/services/ai';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';
import { buildRiskPrompt } from '@/lib/prompts/riskPrompt';
import type { RiskFactor } from '@/types/recommendation';
import { RISK_CATEGORIES } from '@/constants';

function buildFallbackRisks(state: GraphState): RiskFactor[] {
  const risks: RiskFactor[] = [];
  const { financialData } = state;

  // Debt risk
  if (financialData?.totalDebt && financialData?.latestRevenue) {
    const debtRatio = financialData.totalDebt / financialData.latestRevenue;
    risks.push({
      category: 'Debt Risk',
      level: debtRatio > 2 ? 'high' : debtRatio > 0.5 ? 'medium' : 'low',
      description: `Debt-to-revenue ratio of ${debtRatio.toFixed(2)}x.`,
    });
  }

  // Add generic risks for all categories not covered
  const covered = new Set(risks.map((r) => r.category));
  RISK_CATEGORIES.forEach((cat) => {
    if (!covered.has(cat)) {
      risks.push({
        category: cat,
        level: 'medium',
        description: `Risk assessment requires more data. Review ${cat.toLowerCase()} exposure carefully.`,
      });
    }
  });

  return risks;
}

/**
 * Node 6: Risk Analysis
 * Uses AI to assess risks across 7 categories.
 */
export async function riskAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] riskAnalysis:', state.company);

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
          latestNetIncome: state.financialData.latestNetIncome,
          totalDebt: state.financialData.totalDebt,
          cash: state.financialData.cash,
          metrics: state.financialData.metrics,
        }, null, 2)
      : 'Not available';
    const webInsights = state.webInsights.length > 0
      ? state.webInsights.slice(0, 3).map((w) => `• ${w.title}: ${w.content.slice(0, 120)}`).join('\n')
      : 'Not available';

    const prompt = buildRiskPrompt({
      company: state.company,
      profile,
      financials,
      webInsights,
    });

    const aiResult = await generateWithAI(SYSTEM_PROMPT, prompt);
    if (aiResult) {
      const parsed = JSON.parse(aiResult.text);
      if (Array.isArray(parsed.risks)) {
        console.log(`[Node] riskAnalysis: used ${aiResult.provider}`);
        return { risks: parsed.risks as RiskFactor[], errors: [...state.errors] };
      }
    }

    // Fallback to rule-based if both AI providers unavailable
    return {
      risks: buildFallbackRisks(state),
      errors: [...state.errors, 'Risk analysis used rule-based fallback (Gemini and Groq both unavailable)'],
    };
  } catch (err) {
    const msg = `Risk analysis failed: ${String(err)}`;
    console.error('[Node] riskAnalysis error:', err);
    return {
      risks: buildFallbackRisks(state),
      errors: [...state.errors, msg],
    };
  }
}
