import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildRiskPrompt(data: {
  company: string;
  companySummary: string;
  financialSummary: string;
  webSummary: string;
}): string {
  return `Assess investment risks for: ${data.company}

COMPANY: ${data.companySummary}
FINANCIALS: ${data.financialSummary}
WEB: ${data.webSummary}

Rate each category (Market, Business, Debt, Regulatory, Competition, Geographical, Technology) as low/medium/high with a 1-sentence evidence-based description.

Return JSON: {"risks":[{"category":"string","level":"low"|"medium"|"high","description":"string"}]}
${JSON_FORMAT_REMINDER}`;
}
