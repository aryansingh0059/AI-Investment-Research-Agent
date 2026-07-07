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

  // Financial health score
  let financialHealth = 50;
  if (financialData?.metrics) {
    const m = financialData.metrics;
    if (m.netMargin != null) financialHealth += m.netMargin > 0.2 ? 15 : m.netMargin > 0.1 ? 8 : -5;
    if (m.roe != null) financialHealth += m.roe > 0.2 ? 10 : m.roe > 0.1 ? 5 : -5;
    if (m.debtToEquity != null) financialHealth += m.debtToEquity < 0.5 ? 10 : m.debtToEquity < 1.5 ? 0 : -15;
    if (m.revenueGrowthYoy != null) financialHealth += m.revenueGrowthYoy > 0.15 ? 10 : m.revenueGrowthYoy > 0.05 ? 5 : 0;
  }
  financialHealth = Math.max(0, Math.min(100, financialHealth));

  // Risk score (higher = safer)
  let riskScore = 60;
  const highRisks = risks.filter((r) => r.level === 'high').length;
  const mediumRisks = risks.filter((r) => r.level === 'medium').length;
  riskScore -= highRisks * 12 + mediumRisks * 5;
  riskScore = Math.max(0, Math.min(100, riskScore));

  // Growth score
  let growthScore = 50;
  const highGrowth = growthFactors.filter((g) => g.impact === 'high').length;
  const mediumGrowth = growthFactors.filter((g) => g.impact === 'medium').length;
  growthScore += highGrowth * 10 + mediumGrowth * 5;
  if (financialData?.metrics?.revenueGrowthYoy != null) {
    growthScore += financialData.metrics.revenueGrowthYoy > 0.2 ? 15 : 0;
  }
  growthScore = Math.max(0, Math.min(100, growthScore));

  // Sentiment adjustment
  let sentimentBonus = 0;
  if (newsSentiment?.overall === 'positive') sentimentBonus = 8;
  else if (newsSentiment?.overall === 'negative') sentimentBonus = -8;

  // Investment score
  const investmentScore = Math.round(
    financialHealth * 0.35 + growthScore * 0.25 + riskScore * 0.2 + (50 + sentimentBonus) * 0.1 + 50 * 0.1
  );

  // Confidence based on data quality
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

  const reasoning = `Based on available data, ${state.company} has been assessed across multiple dimensions:

Financial Health (${financialHealth}/100): ${
    financialHealth >= 70
      ? 'The company demonstrates strong financial metrics including healthy margins and manageable debt levels.'
      : financialHealth >= 50
      ? 'Financial metrics show moderate strength with some areas of concern.'
      : 'Financial health indicators reveal challenges that investors should carefully consider.'
  }

Risk Assessment (${riskScore}/100): ${
    riskScore >= 70
      ? 'Risk profile is favorable with most risk categories at low-to-medium levels.'
      : riskScore >= 50
      ? 'Moderate risk environment with several factors requiring monitoring.'
      : 'Elevated risk factors across multiple categories warrant caution.'
  }

Growth Outlook (${growthScore}/100): ${
    growthScore >= 70
      ? 'Multiple high-impact growth catalysts identified across expansion, innovation, and market opportunities.'
      : growthScore >= 50
      ? 'Moderate growth prospects supported by market expansion and operational improvements.'
      : 'Limited near-term growth catalysts with potential headwinds.'
  }

News Sentiment: ${newsSentiment?.overall ?? 'neutral'} (${newsSentiment?.positiveCount ?? 0} positive, ${newsSentiment?.negativeCount ?? 0} negative articles).

Note: This analysis was generated using rule-based scoring due to limited AI availability. For more nuanced insights, ensure all API keys are configured.`;

  return {
    recommendation,
    scores: { investment: investmentScore, financialHealth, riskScore, growthScore, confidence },
    summary,
    reasoning,
  };
}

/**
 * Node 9: Decision Engine
 * The final node — synthesizes all data and produces the investment recommendation.
 */
export async function decisionEngineNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] decisionEngine:', state.company);

  try {
    const profile = state.companyProfile
      ? JSON.stringify({
          symbol: state.companyProfile.symbol,
          name: state.companyProfile.name,
          industry: state.companyProfile.industry,
          marketCap: state.companyProfile.marketCap,
          currentPrice: state.companyProfile.currentPrice,
          ceo: state.companyProfile.ceo,
        }, null, 2)
      : 'Not available';

    const financials = state.financialData
      ? JSON.stringify({
          latestRevenue: state.financialData.latestRevenue,
          latestNetIncome: state.financialData.latestNetIncome,
          latestEPS: state.financialData.latestEPS,
          latestFreeCashFlow: state.financialData.latestFreeCashFlow,
          totalDebt: state.financialData.totalDebt,
          cash: state.financialData.cash,
          metrics: state.financialData.metrics,
          incomeStatements: (state.financialData.incomeStatements || []).slice(0, 2),
        }, null, 2)
      : 'Not available';

    const news = state.news.length > 0
      ? state.news.slice(0, 3).map((n) => `• [${n.sentiment?.toUpperCase()}] ${n.title}`).join('\n')
      : 'Not available';

    const webInsights = state.webInsights.length > 0
      ? state.webInsights.slice(0, 3).map((w) => `• ${w.title}: ${w.content.slice(0, 120)}`).join('\n')
      : 'Not available';

    const competitors = state.competitors.length > 0
      ? state.competitors.slice(0, 3).map((c) => `${c.symbol} (MCap: ${c.marketCap})`).join(', ')
      : 'Not available';

    const swot = state.swot ? JSON.stringify(state.swot, null, 2) : 'Not available';
    const risks = state.risks.length > 0 ? JSON.stringify(state.risks.slice(0, 4), null, 2) : 'Not available';
    const growthFactors = state.growthFactors.length > 0
      ? JSON.stringify(state.growthFactors.slice(0, 4), null, 2)
      : 'Not available';
    const newsSentiment = state.newsSentiment
      ? JSON.stringify(state.newsSentiment, null, 2)
      : 'Not available';

    const prompt = buildDecisionPrompt({
      company: state.company,
      profile,
      financials,
      news,
      webInsights,
      competitors,
      swot,
      risks,
      growthFactors,
      newsSentiment,
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

    // Fallback to rule-based scoring
    const fallback = calculateFallbackScores(state);
    return {
      ...fallback,
      errors: [...state.errors, 'Decision engine used rule-based fallback (Gemini and Groq both unavailable)'],
    };
  } catch (err) {
    const msg = `Decision engine failed: ${String(err)}`;
    console.error('[Node] decisionEngine error:', err);
    const fallback = calculateFallbackScores(state);
    return { ...fallback, errors: [...state.errors, msg] };
  }
}
