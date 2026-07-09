import type { GraphState } from '../state';
import { generateWithAI } from '@/lib/services/ai';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';
import { buildRiskPrompt } from '@/lib/prompts/riskPrompt';
import type { RiskFactor } from '@/types/recommendation';
import { RISK_CATEGORIES } from '@/constants';

function buildFallbackRisks(state: GraphState): RiskFactor[] {
  const risks: RiskFactor[] = [];
  const { financialData } = state;

  if (financialData?.totalDebt && financialData?.latestRevenue) {
    const debtRatio = financialData.totalDebt / financialData.latestRevenue;
    risks.push({
      category: 'Debt Risk',
      level: debtRatio > 2 ? 'high' : debtRatio > 0.5 ? 'medium' : 'low',
      description: `Debt-to-revenue ratio of ${debtRatio.toFixed(2)}x.`,
    });
  }

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
 * Uses compact summary strings to reduce token usage.
 */
export async function riskAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] riskAnalysis:', state.company);

  try {
    const prompt = buildRiskPrompt({
      company: state.company,
      companySummary: state.companySummary ?? 'Not available',
      financialSummary: state.financialSummary ?? 'Not available',
      webSummary: state.webSummary ?? 'Not available',
    });

    const aiResult = await generateWithAI(SYSTEM_PROMPT, prompt);
    if (aiResult) {
      const parsed = JSON.parse(aiResult.text);
      if (Array.isArray(parsed.risks)) {
        console.log(`[Node] riskAnalysis: used ${aiResult.provider}`);
        return { risks: parsed.risks as RiskFactor[], errors: [...state.errors] };
      }
    }

    return {
      risks: buildFallbackRisks(state),
      errors: [...state.errors, 'Risk analysis used rule-based fallback'],
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
