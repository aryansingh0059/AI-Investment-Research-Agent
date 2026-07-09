import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildSWOTPrompt(data: {
  company: string;
  companySummary: string;
  financialSummary: string;
  newsSummary: string;
  webSummary: string;
  competitors: string;
}): string {
  return `Generate SWOT analysis for: ${data.company}

COMPANY: ${data.companySummary}
FINANCIALS: ${data.financialSummary}
NEWS: ${data.newsSummary}
WEB: ${data.webSummary}
COMPETITORS: ${data.competitors}

Provide 3-5 specific, evidence-based items per category.

Return JSON: {"strengths":["string"],"weaknesses":["string"],"opportunities":["string"],"threats":["string"]}
${JSON_FORMAT_REMINDER}`;
}
