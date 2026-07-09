import type {
  CompanyProfile,
  Competitor,
  FinancialData,
  NewsArticle,
  NewsSentiment,
  WebInsight,
  SWOTAnalysis,
  RiskFactor,
  GrowthFactor,
  RecommendationType,
  Scores,
  DataQualityFlags,
} from '@/types';

/**
 * LangGraph shared state for the investment analysis workflow.
 * Each node reads from and writes to this state.
 */
export interface GraphState {
  /** The company name entered by the user */
  company: string;

  /** Resolved stock ticker symbol */
  symbol?: string;

  /** Company profile data from Yahoo Finance + Finnhub (for logo) */
  companyProfile?: CompanyProfile;

  /** Financial statements and metrics from Yahoo Finance */
  financialData?: FinancialData;

  /** News articles from NewsAPI */
  news: NewsArticle[];

  /** Aggregated news sentiment */
  newsSentiment?: NewsSentiment;

  /** Competitor profiles */
  competitors: Competitor[];

  /** Web search insights from Tavily */
  webInsights: WebInsight[];

  /** AI-generated SWOT analysis */
  swot?: SWOTAnalysis;

  /** AI-generated risk factors */
  risks: RiskFactor[];

  /** AI-generated growth factors */
  growthFactors: GrowthFactor[];

  /** Final investment recommendation */
  recommendation?: RecommendationType;

  /** Composite scores */
  scores?: Scores;

  /** Executive summary */
  summary?: string;

  /** Detailed AI reasoning */
  reasoning?: string;

  /** Data availability flags */
  dataQuality: DataQualityFlags;

  /** Accumulated non-fatal errors */
  errors: string[];

  // ─── Compact summaries (used by downstream nodes to reduce token usage) ────

  /** Compact company + market data string for AI prompts */
  companySummary?: string;

  /** Compact financial metrics string for AI prompts */
  financialSummary?: string;

  /** Top-5 news headline bullets for AI prompts */
  newsSummary?: string;

  /** Top-3 web search result bullets for AI prompts */
  webSummary?: string;
}

/** Initial state factory */
export function createInitialState(company: string): GraphState {
  return {
    company,
    news: [],
    competitors: [],
    webInsights: [],
    risks: [],
    growthFactors: [],
    dataQuality: {
      hasCompanyProfile: false,
      hasFinancialData: false,
      hasNews: false,
      hasWebInsights: false,
      hasCompetitors: false,
    },
    errors: [],
  };
}
