import { JSON_FORMAT_REMINDER } from './systemPrompt';

export function buildRiskPrompt(data: {
  company: string;
  profile: string;
  financials: string;
  webInsights: string;
}): string {
  return `Analyze the investment risks for ${data.company} based on the following data.

COMPANY PROFILE:
${data.profile}

FINANCIAL DATA:
${data.financials}

WEB RESEARCH:
${data.webInsights}

Assess risks across these categories:
- Market Risk (macroeconomic exposure)
- Business Risk (operational, competitive)
- Debt Risk (leverage, solvency)
- Regulatory Risk (compliance, legal)
- Competition Risk (market share threats)
- Geographical Risk (geographic concentration)
- Technology Risk (disruption, obsolescence)

Return this exact JSON structure:
{
  "risks": [
    {
      "category": "Market Risk",
      "level": "low" | "medium" | "high",
      "description": "Specific, evidence-based description"
    },
    ...
  ]
}
${JSON_FORMAT_REMINDER}`;
}
