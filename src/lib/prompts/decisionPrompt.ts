import { JSON_FORMAT_REMINDER } from './systemPrompt';
import type { CompactPayload } from '@/lib/services/summaryBuilder';

export function buildDecisionPrompt(data: CompactPayload): string {
  return `Perform a comprehensive equity research analysis and investment decision for the following company based on the structured data provided.

COMPANY PROFILE:
${JSON.stringify(data.company, null, 2)}

FINANCIAL DATA (LATEST 4 YEARS):
- Ratios & Margins:
${JSON.stringify(data.financials.metrics, null, 2)}
- Annual Statements:
${JSON.stringify(data.financials.statements, null, 2)}

MARKET NEWS:
${JSON.stringify(data.news, null, 2)}

WEB INSIGHTS:
${JSON.stringify(data.search, null, 2)}

COMPETITORS:
${JSON.stringify(data.competitors, null, 2)}

Based on this information, generate the complete research report.
- Score Guidelines: confidence, investmentScore, financialHealth, growthScore, riskScore must be integers from 0 to 100.
- Recommendation: must be "INVEST", "WATCH", or "PASS".
- SWOT: provide 3-5 items per array.
- Risks: categorize and rate each factor (Market, Business, Debt, Regulatory, Competition, Geographical, Technology) as low/medium/high with a 1-sentence description.
- Growth Drivers: map drivers (Revenue Growth, Market Expansion, Innovation, AI & Technology, Strategic Partnerships, Competitive Positioning) as low/medium/high impact with a 1-sentence description.

You must return ONLY a valid JSON object matching the following TypeScript schema structure:
{
  "executiveSummary": "2-3 sentence overview of the company and key takeaways.",
  "recommendation": "INVEST" | "WATCH" | "PASS",
  "confidence": 0-100,
  "investmentScore": 0-100,
  "financialHealth": 0-100,
  "growthScore": 0-100,
  "riskScore": 0-100,
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "threats": ["threat 1", "threat 2", ...],
  "risks": [
    {
      "category": "Market Risk" | "Business Risk" | "Debt Risk" | "Regulatory Risk" | "Competition Risk" | "Geographical Risk" | "Technology Risk",
      "level": "low" | "medium" | "high",
      "description": "Risk details based on evidence."
    }
  ],
  "growthFactors": [
    {
      "category": "Revenue Growth" | "Market Expansion" | "Innovation" | "AI & Technology" | "Strategic Partnerships" | "Competitive Positioning",
      "impact": "low" | "medium" | "high",
      "description": "Growth catalyst details based on evidence."
    }
  ],
  "investmentThesis": "Detailed strategic thesis explaining the main rationale.",
  "reasoning": "Detailed narrative report covering: Financial Profile, Industry/Competition, Major Catalysts, Critical Risks, Valuation & Recommendation Rationale."
}

${JSON_FORMAT_REMINDER}`;
}
