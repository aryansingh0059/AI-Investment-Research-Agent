import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildGrowthPrompt(data: {
  company: string;
  profile: string;
  financials: string;
  webInsights: string;
  news: string;
}): string {
  return `Analyze the growth prospects for ${data.company} based on the following data.

COMPANY PROFILE:
${data.profile}

FINANCIAL DATA:
${data.financials}

WEB RESEARCH INSIGHTS:
${data.webInsights}

RECENT NEWS:
${data.news}

Identify and describe growth factors across these categories:
- Revenue Growth (historical trends, projections)
- Market Expansion (new markets, geographies)
- Innovation (new products, R&D, patents)
- AI & Technology Initiatives
- Strategic Partnerships & Acquisitions
- Competitive Positioning

Return this exact JSON structure:
{
  "growthFactors": [
    {
      "category": "Revenue Growth",
      "description": "Specific description with supporting evidence",
      "impact": "low" | "medium" | "high"
    },
    ...
  ]
}
${JSON_FORMAT_REMINDER}`;
}
