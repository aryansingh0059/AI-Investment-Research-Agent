import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildGrowthPrompt(data: {
  company: string;
  companySummary: string;
  financialSummary: string;
  webSummary: string;
  newsSummary: string;
}): string {
  return `Identify growth catalysts for: ${data.company}

COMPANY: ${data.companySummary}
FINANCIALS: ${data.financialSummary}
WEB: ${data.webSummary}
NEWS: ${data.newsSummary}

Identify growth factors across: Revenue Growth, Market Expansion, Innovation, AI & Technology, Strategic Partnerships, Competitive Positioning. Rate each as low/medium/high impact.

Return JSON: {"growthFactors":[{"category":"string","description":"string","impact":"low"|"medium"|"high"}]}
${JSON_FORMAT_REMINDER}`;
}
