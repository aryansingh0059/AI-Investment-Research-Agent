import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildDecisionPrompt(data: {
  company: string;
  companySummary: string;
  financialSummary: string;
  newsSummary: string;
  webSummary: string;
  competitors: string;
  swot: string;
  risks: string;
  growthFactors: string;
  sentiment: string;
}): string {
  return `Investment analysis for: ${data.company}

COMPANY: ${data.companySummary}

FINANCIALS: ${data.financialSummary}

NEWS (sentiment: ${data.sentiment}):
${data.newsSummary}

WEB INSIGHTS:
${data.webSummary}

COMPETITORS: ${data.competitors}

SWOT:
${data.swot}

RISKS:
${data.risks}

GROWTH:
${data.growthFactors}

Score guidelines: investmentScore >70=INVEST, 40-70=WATCH, <40=PASS. riskScore: higher=safer.

Return JSON:
{"company":"${data.company}","recommendation":"INVEST"|"WATCH"|"PASS","confidence":0-100,"investmentScore":0-100,"financialHealth":0-100,"riskScore":0-100,"growthScore":0-100,"summary":"2-3 sentence executive summary","reasoning":"5-6 paragraph analysis covering: financial health, growth catalysts, risks, competitive position, valuation, final rationale."}
${JSON_FORMAT_REMINDER}`;
}
