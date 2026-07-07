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

  /** Company profile data from Finnhub */
  companyProfile?: CompanyProfile;

  /** Financial statements and metrics from FMP + Finnhub */
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
