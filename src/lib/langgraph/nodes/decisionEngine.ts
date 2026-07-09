import type { GraphState } from '../state';
import { generateWithAI } from '@/lib/services/ai';
import { SYSTEM_PROMPT } from '@/lib/prompts/systemPrompt';
import { buildDecisionPrompt } from '@/lib/prompts/decisionPrompt';
import { buildCompactPayload } from '@/lib/services/summaryBuilder';
import { cleanAndParseJSON } from '@/lib/utils/json';
import type { RecommendationType, Scores, SWOTAnalysis, RiskFactor, GrowthFactor } from '@/types/recommendation';
import { RISK_CATEGORIES } from '@/constants';

/**
 * Rule-based fallback when AI is completely unavailable.
 */
function calculateFallbackScores(state: GraphState): {
  recommendation: RecommendationType;
  scores: Scores;
  summary: string;
  reasoning: string;
  swot: SWOTAnalysis;
  risks: RiskFactor[];
  growthFactors: GrowthFactor[];
} {
  const { financialData, newsSentiment } = state;

  let financialHealth = 50;
  if (financialData?.metrics) {
    const m = financialData.metrics;
    if (m.netMargin != null) financialHealth += m.netMargin > 0.2 ? 15 : m.netMargin > 0.1 ? 8 : -5;
    if (m.roe != null) financialHealth += m.roe > 0.2 ? 10 : m.roe > 0.1 ? 5 : -5;
    if (m.debtToEquity != null) financialHealth += m.debtToEquity < 0.5 ? 10 : m.debtToEquity < 1.5 ? 0 : -15;
    if (m.revenueGrowthYoy != null) financialHealth += m.revenueGrowthYoy > 0.15 ? 10 : m.revenueGrowthYoy > 0.05 ? 5 : 0;
  }
  financialHealth = Math.max(0, Math.min(100, financialHealth));

  const risks: RiskFactor[] = [];
  if (financialData?.totalDebt && financialData?.latestRevenue) {
    const debtRatio = financialData.totalDebt / financialData.latestRevenue;
    risks.push({
      category: 'Debt Risk',
      level: debtRatio > 2 ? 'high' : debtRatio > 0.5 ? 'medium' : 'low',
      description: `Debt-to-revenue ratio of ${debtRatio.toFixed(2)}x.`,
    });
  }
  RISK_CATEGORIES.forEach((cat) => {
    if (!risks.some((r) => r.category === cat)) {
      risks.push({
        category: cat,
        level: 'medium',
        description: `Risk assessment fallback. Review ${cat.toLowerCase()} exposure.`,
      });
    }
  });

  const growthFactors: GrowthFactor[] = [];
  if (financialData?.metrics?.revenueGrowthYoy != null) {
    const growth = financialData.metrics.revenueGrowthYoy;
    growthFactors.push({
      category: 'Revenue Growth',
      description: `Year-over-year revenue growth of ${(growth * 100).toFixed(1)}%.`,
      impact: growth > 0.15 ? 'high' : growth > 0.05 ? 'medium' : 'low',
    });
  }
  growthFactors.push({
    category: 'Innovation',
    description: 'Tech integration and product updates continue to show positive progress.',
    impact: 'medium',
  });

  const swot: SWOTAnalysis = {
    strengths: ['Established global market position'],
    weaknesses: ['Vulnerable to macroeconomic adjustments'],
    opportunities: ['Continued expansion of service lines'],
    threats: ['Elevated market competition'],
  };

  let riskScore = 60;
  const highRisks = risks.filter((r) => r.level === 'high').length;
  const mediumRisks = risks.filter((r) => r.level === 'medium').length;
  riskScore -= highRisks * 12 + mediumRisks * 5;
  riskScore = Math.max(0, Math.min(100, riskScore));

  let growthScore = 50;
  const highGrowth = growthFactors.filter((g) => g.impact === 'high').length;
  const mediumGrowth = growthFactors.filter((g) => g.impact === 'medium').length;
  growthScore += highGrowth * 10 + mediumGrowth * 5;
  growthScore = Math.max(0, Math.min(100, growthScore));

  let sentimentBonus = 0;
  if (newsSentiment?.overall === 'positive') sentimentBonus = 8;
  else if (newsSentiment?.overall === 'negative') sentimentBonus = -8;

  const investmentScore = Math.round(
    financialHealth * 0.35 + growthScore * 0.25 + riskScore * 0.2 + (50 + sentimentBonus) * 0.1 + 50 * 0.1
  );

  const recommendation: RecommendationType =
    investmentScore >= 65 ? 'INVEST' : investmentScore >= 45 ? 'WATCH' : 'PASS';

  const summary = `${state.company} receives a ${recommendation} rating with an investment score of ${investmentScore}/100.`;
  const reasoning = `Fallback analysis mode activated due to service limits or missing configurations. Configured API key limits or quota limitations might be preventing AI model responses.`;

  return {
    recommendation,
    scores: { investment: investmentScore, financialHealth, riskScore, growthScore, confidence: 60 },
    summary,
    reasoning,
    swot,
    risks,
    growthFactors,
  };
}

/**
 * Node 9: Decision Engine
 * Consolidated AI Node — performs the ONLY LLM request in the entire LangGraph workflow.
 * Uses summaryBuilder to construct a compact payload under 1500-2000 tokens.
 * Gracefully parses combined outputs including SWOT, growth, risks, and scores.
 */
export async function decisionEngineNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] decisionEngine (Consolidated AI Analysis):', state.company);

  try {
    // 1. Build compact structured payload (Summary Builder)
    const compactPayload = buildCompactPayload(state);

    // 2. Format consolidated decision prompt
    const prompt = buildDecisionPrompt(compactPayload);

    // 3. Trigger single LLM request (Gemini with Groq fallback and 503/429 retries)
    const aiResult = await generateWithAI(SYSTEM_PROMPT, prompt, 0.1);

    if (aiResult) {
      console.log(`[Node] decisionEngine: Successfully used ${aiResult.provider}`);
      
      // Parse the consolidated JSON
      const parsed = cleanAndParseJSON<any>(aiResult.text);

      // Structure swot object
      const swot: SWOTAnalysis = {
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
        threats: Array.isArray(parsed.threats) ? parsed.threats : [],
      };

      // Structure risks array
      const risks: RiskFactor[] = Array.isArray(parsed.risks)
        ? parsed.risks.map((r: any) => ({
            category: String(r.category || 'Market Risk'),
            level: String(r.level || 'medium') as 'low' | 'medium' | 'high',
            description: String(r.description || ''),
          }))
        : [];

      // Structure growth factors array
      const growthFactors: GrowthFactor[] = Array.isArray(parsed.growthFactors)
        ? parsed.growthFactors.map((g: any) => ({
            category: String(g.category || 'Innovation'),
            impact: String(g.impact || 'medium') as 'low' | 'medium' | 'high',
            description: String(g.description || ''),
          }))
        : [];

      // Parse final recommendation action
      const recommendation = (parsed.recommendation || 'WATCH') as RecommendationType;

      // Extract reasoning/thesis strings
      const thesis = parsed.investmentThesis ? `INVESTMENT THESIS:\n${parsed.investmentThesis}\n\n` : '';
      const reasoningText = thesis + (parsed.reasoning || '');

      return {
        recommendation,
        scores: {
          investment: Number(parsed.investmentScore ?? parsed.scores?.investment ?? 50),
          financialHealth: Number(parsed.financialHealth ?? parsed.scores?.financialHealth ?? 50),
          riskScore: Number(parsed.riskScore ?? parsed.scores?.riskScore ?? 50),
          growthScore: Number(parsed.growthScore ?? parsed.scores?.growthScore ?? 50),
          confidence: Number(parsed.confidence ?? parsed.scores?.confidence ?? 50),
        },
        summary: parsed.executiveSummary || parsed.summary || '',
        reasoning: reasoningText,
        swot,
        risks,
        growthFactors,
        errors: [...state.errors],
      };
    }

    // If AI fails/null, trigger rule-based fallback
    const fallback = calculateFallbackScores(state);
    return {
      ...fallback,
      errors: [...state.errors, 'Decision engine fell back to rule-based analysis (AI services failed)'],
    };
  } catch (err) {
    const msg = `Consolidated AI engine failed: ${String(err)}`;
    console.error('[Node] decisionEngine error:', err);
    const fallback = calculateFallbackScores(state);
    return {
      ...fallback,
      errors: [...state.errors, msg],
    };
  }
}
