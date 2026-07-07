import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildSWOTPrompt(data: {
  company: string;
  profile: string;
  financials: string;
  news: string;
  webInsights: string;
  competitors: string;
}): string {
  return `Analyze the following data about ${data.company} and generate a comprehensive SWOT analysis.

COMPANY PROFILE:
${data.profile}

FINANCIAL DATA:
${data.financials}

RECENT NEWS:
${data.news}

WEB RESEARCH INSIGHTS:
${data.webInsights}

COMPETITORS:
${data.competitors}

Generate a SWOT analysis with 4-6 items per category. Be specific and evidence-based.

Return this exact JSON structure:
{
  "strengths": ["string", ...],
  "weaknesses": ["string", ...],
  "opportunities": ["string", ...],
  "threats": ["string", ...]
}
${JSON_FORMAT_REMINDER}`;
}
