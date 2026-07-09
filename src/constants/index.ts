export const FINNHUB_BASE = 'https://finnhub.io/api/v1';
export const NEWSAPI_BASE = 'https://newsapi.org/v2';
export const TAVILY_BASE = 'https://api.tavily.com';

export const ANALYSIS_STEP_LABELS: Record<string, string> = {
  idle: 'Waiting...',
  company_research: 'Researching Company Profile',
  financial_analysis: 'Fetching Financial Data',
  news_analysis: 'Reading Latest News',
  web_search: 'Searching the Web',
  competitor_analysis: 'Analyzing Competitors',
  risk_analysis: 'Assessing Risks',
  growth_analysis: 'Evaluating Growth Prospects',
  swot_generation: 'Generating SWOT Analysis',
  decision_engine: 'AI Making Investment Decision',
  complete: 'Analysis Complete',
  error: 'Error Occurred',
};

export const SCORING_WEIGHTS = {
  financial: 0.35,
  growth: 0.25,
  risk: 0.2,
  sentiment: 0.1,
  competitive: 0.1,
};

export const RISK_CATEGORIES = [
  'Market Risk',
  'Business Risk',
  'Debt Risk',
  'Regulatory Risk',
  'Competition Risk',
  'Geographical Risk',
  'Technology Risk',
] as const;

export const EXAMPLE_COMPANIES = [
  { name: 'Apple', symbol: 'AAPL' },
  { name: 'Tesla', symbol: 'TSLA' },
  { name: 'Microsoft', symbol: 'MSFT' },
  { name: 'Nvidia', symbol: 'NVDA' },
  { name: 'Reliance Industries', symbol: 'RELIANCE' },
  { name: 'TCS', symbol: 'TCS' },
  { name: 'Infosys', symbol: 'INFY' },
];

export const MAX_RETRIES = 2;
export const REQUEST_TIMEOUT = 15000; // 15s

export const TAVILY_SEARCH_QUERIES = (company: string) => [
  `${company} growth strategy 2024 2025`,
  `${company} AI initiatives artificial intelligence`,
  `${company} future plans expansion`,
  `${company} recent acquisitions partnerships`,
  `${company} market competition challenges`,
  `${company} market outlook analyst opinion`,
];
