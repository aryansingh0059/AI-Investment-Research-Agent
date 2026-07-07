import type { CompanyProfile, Competitor } from './company';
import type { FinancialData } from './financial';
import type { NewsArticle, NewsSentiment, WebInsight } from './news';

export type RecommendationType = 'INVEST' | 'WATCH' | 'PASS';

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RiskFactor {
  category: string;
  level: 'low' | 'medium' | 'high';
  description: string;
}

export interface GrowthFactor {
  category: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface Scores {
  investment: number;       // 0–100
  financialHealth: number;  // 0–100
  riskScore: number;        // 0–100 (lower = riskier)
  growthScore: number;      // 0–100
  confidence: number;       // 0–100
}

export interface AnalysisResult {
  company: string;
  companyProfile?: CompanyProfile;
  financialData?: FinancialData;
  news: NewsArticle[];
  newsSentiment?: NewsSentiment;
  competitors: Competitor[];
  webInsights: WebInsight[];
  swot?: SWOTAnalysis;
  risks: RiskFactor[];
  growthFactors: GrowthFactor[];
  recommendation: RecommendationType;
  scores: Scores;
  summary: string;
  reasoning: string;
  dataQuality: DataQualityFlags;
  analyzedAt: string;
}

export interface DataQualityFlags {
  hasCompanyProfile: boolean;
  hasFinancialData: boolean;
  hasNews: boolean;
  hasWebInsights: boolean;
  hasCompetitors: boolean;
}

export type AnalysisStep =
  | 'idle'
  | 'company_research'
  | 'financial_analysis'
  | 'news_analysis'
  | 'web_search'
  | 'competitor_analysis'
  | 'risk_analysis'
  | 'growth_analysis'
  | 'swot_generation'
  | 'decision_engine'
  | 'complete'
  | 'error';

export interface SSEEvent {
  step: AnalysisStep;
  message: string;
  data?: Partial<AnalysisResult>;
  error?: string;
}

export interface GraphState {
  company: string;
  companyProfile?: CompanyProfile;
  financialData?: FinancialData;
  news: NewsArticle[];
  newsSentiment?: NewsSentiment;
  competitors: Competitor[];
  webInsights: WebInsight[];
  swot?: SWOTAnalysis;
  risks: RiskFactor[];
  growthFactors: GrowthFactor[];
  recommendation?: RecommendationType;
  scores?: Scores;
  summary?: string;
  reasoning?: string;
  dataQuality: DataQualityFlags;
  errors: string[];
}
