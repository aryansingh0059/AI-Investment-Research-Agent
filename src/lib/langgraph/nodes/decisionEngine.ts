import type { GraphState } from '../state';
import { generateWithAI } from '@/lib/services/ai';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';
import { buildDecisionPrompt } from '@/lib/prompts/decisionPrompt';
import type { RecommendationType, Scores } from '@/types/recommendation';

/**
 * Rule-based scoring fallback when AI is unavailable.
 */
function calculateFallbackScores(state: GraphState): {
  recommendation: RecommendationType;
  scores: Scores;
  summary: string;
  reasoning: string;
} {
  const { financialData, newsSentiment, risks, growthFactors, dataQuality } = state;

  let financialHealth = 50;
  if (financialData?.metrics) {
    const m = financialData.metrics;
    if (m.netMargin != null) financialHealth += m.netMargin > 0.2 ? 15 : m.netMargin > 0.1 ? 8 : -5;
    if (m.roe != null) financialHealth += m.roe > 0.2 ? 10 : m.roe > 0.1 ? 5 : -5;
    if (m.debtToEquity != null) financialHealth += m.debtToEquity < 0.5 ? 10 : m.debtToEquity < 1.5 ? 0 : -15;
    if (m.revenueGrowthYoy != null) financialHealth += m.revenueGrowthYoy > 0.15 ? 10 : m.revenueGrowthYoy > 0.05 ? 5 : 0;
  }
  financialHealth = Math.max(0, Math.min(100, financialHealth));

  let riskScore = 60;
  const highRisks = risks.filter((r) => r.level === 'high').length;
  const mediumRisks = risks.filter((r) => r.level === 'medium').length;
  riskScore -= highRisks * 12 + mediumRisks * 5;
  riskScore = Math.max(0, Math.min(100, riskScore));

  let growthScore = 50;
  const highGrowth = growthFactors.filter((g) => g.impact === 'high').length;
  const mediumGrowth = growthFactors.filter((g) => g.impact === 'medium').length;
  growthScore += highGrowth * 10 + mediumGrowth * 5;
  if (financialData?.metrics?.revenueGrowthYoy != null) {
    growthScore += financialData.metrics.revenueGrowthYoy > 0.2 ? 15 : 0;
  }
  growthScore = Math.max(0, Math.min(100, growthScore));

  let sentimentBonus = 0;
  if (newsSentiment?.overall === 'positive') sentimentBonus = 8;
  else if (newsSentiment?.overall === 'negative') sentimentBonus = -8;

  const investmentScore = Math.round(
    financialHealth * 0.35 + growthScore * 0.25 + riskScore * 0.2 + (50 + sentimentBonus) * 0.1 + 50 * 0.1
  );

  const dataPoints = Object.values(dataQuality).filter(Boolean).length;
  const confidence = Math.round((dataPoints / 5) * 100);

  const recommendation: RecommendationType =
    investmentScore >= 65 ? 'INVEST' : investmentScore >= 45 ? 'WATCH' : 'PASS';

  const summary = `${state.company} receives a ${recommendation} recommendation with an investment score of ${investmentScore}/100. ${
    recommendation === 'INVEST'
      ? 'The company demonstrates strong fundamentals and growth potential.'
      : recommendation === 'WATCH'
      ? 'The company shows mixed signals warranting further monitoring.'
      : 'Current risk-reward profile does not favor investment at this time.'
  }`;

  const reasoning = `Rule-based analysis: Financial Health ${financialHealth}/100, Risk ${riskScore}/100, Growth ${growthScore}/100. News sentiment: ${newsSentiment?.overall ?? 'neutral'}. Note: AI providers unavailable; configure GEMINI_API_KEY or GROQ_API_KEY for deeper analysis.`;

  return {
    recommendation,
    scores: { investment: investmentScore, financialHealth, riskScore, growthScore, confidence },
    summary,
    reasoning,
  };
}

/**
 * Node 9: Decision Engine
 * Synthesizes all summaries and produces the final investment recommendation.
 * Uses only compact summary strings — never raw API responses.
 */
export async function decisionEngineNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] decisionEngine:', state.company);

  try {
    const competitors =
      state.competitors.length > 0
        ? state.competitors
            .slice(0, 3)
            .map((c) => `${c.symbol}${c.marketCap ? ` (MCap: $${(c.marketCap / 1e9).toFixed(1)}B)` : ''}`)
            .join(', ')
        : 'Not available';

    const swot = state.swot
      ? [
          `Strengths: ${state.swot.strengths.slice(0, 3).join('; ')}`,
          `Weaknesses: ${state.swot.weaknesses.slice(0, 3).join('; ')}`,
          `Opportunities: ${state.swot.opportunities.slice(0, 2).join('; ')}`,
          `Threats: ${state.swot.threats.slice(0, 2).join('; ')}`,
        ].join('\n')
      : 'Not available';

    const risks =
      state.risks.length > 0
        ? state.risks
            .slice(0, 5)
            .map((r) => `${r.category}: ${r.level.toUpperCase()} — ${r.description}`)
            .join('\n')
        : 'Not available';

    const growthFactors =
      state.growthFactors.length > 0
        ? state.growthFactors
            .slice(0, 4)
            .map((g) => `${g.category} (${g.impact}): ${g.description}`)
            .join('\n')
        : 'Not available';

    const sentiment = state.newsSentiment
      ? `${state.newsSentiment.overall} (+${state.newsSentiment.positiveCount} -${state.newsSentiment.negativeCount} =${state.newsSentiment.neutralCount})`
      : 'neutral';

    const prompt = buildDecisionPrompt({
      company: state.company,
      companySummary: state.companySummary ?? 'Not available',
      financialSummary: state.financialSummary ?? 'Not available',
      newsSummary: state.newsSummary ?? 'Not available',
      webSummary: state.webSummary ?? 'Not available',
      competitors,
      swot,
      risks,
      growthFactors,
      sentiment,
    });

    const aiResult = await generateWithAI(SYSTEM_PROMPT, prompt, 0.1);

    if (aiResult) {
      console.log(`[Node] decisionEngine: used ${aiResult.provider}`);
      const parsed = JSON.parse(aiResult.text);
      if (parsed.recommendation && parsed.investmentScore !== undefined) {
        return {
          recommendation: parsed.recommendation as RecommendationType,
          scores: {
            investment: parsed.investmentScore ?? 50,
            financialHealth: parsed.financialHealth ?? 50,
            riskScore: parsed.riskScore ?? 50,
            growthScore: parsed.growthScore ?? 50,
            confidence: parsed.confidence ?? 50,
          },
          summary: parsed.summary ?? '',
          reasoning: parsed.reasoning ?? '',
          errors: [...state.errors],
        };
      }
    }

    const fallback = calculateFallbackScores(state);
    return {
      ...fallback,
      errors: [...state.errors, 'Decision engine used rule-based fallback (AI providers unavailable)'],
    };
  } catch (err) {
    const msg = `Decision engine failed: ${String(err)}`;
    console.error('[Node] decisionEngine error:', err);
    const fallback = calculateFallbackScores(state);
    return { ...fallback, errors: [...state.errors, msg] };
  }
}
