import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildDecisionPrompt(data: {
  company: string;
  profile: string;
  financials: string;
  news: string;
  webInsights: string;
  swot: string;
  risks: string;
  growthFactors: string;
  competitors: string;
  newsSentiment: string;
}): string {
  return `You are making a final investment recommendation for ${data.company}.
Synthesize ALL the information below and produce a comprehensive investment report.

COMPANY PROFILE:
${data.profile}

FINANCIAL DATA:
${data.financials}

RECENT NEWS:
${data.news}

NEWS SENTIMENT:
${data.newsSentiment}

WEB RESEARCH:
${data.webInsights}

COMPETITORS:
${data.competitors}

SWOT ANALYSIS:
${data.swot}

RISK ANALYSIS:
${data.risks}

GROWTH ANALYSIS:
${data.growthFactors}

SCORING GUIDELINES:
- investmentScore (0–100): Overall attractiveness. >70 = INVEST, 40–70 = WATCH, <40 = PASS
- financialHealth (0–100): Balance sheet quality, profitability, cash generation
- riskScore (0–100): Risk-adjusted score. Higher = safer (less risky). <40 = high risk
- growthScore (0–100): Forward-looking growth potential
- confidence (0–100): Reflects data completeness and quality. Missing APIs = lower confidence.

Return this exact JSON structure:
{
  "company": "${data.company}",
  "recommendation": "INVEST" | "WATCH" | "PASS",
  "confidence": number,
  "investmentScore": number,
  "financialHealth": number,
  "riskScore": number,
  "growthScore": number,
  "summary": "2-3 sentence executive summary",
  "reasoning": "Detailed 5-8 paragraph reasoning explaining the recommendation with specific evidence from the data. Cover: financial health assessment, growth catalysts, risks identified, competitive position, valuation, and final recommendation rationale."
}
${JSON_FORMAT_REMINDER}`;
}
