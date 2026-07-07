export type SentimentLabel = 'positive' | 'neutral' | 'negative';

export interface NewsArticle {
  title: string;
  source: string;
  publishedAt: string;
  url: string;
  description?: string;
  content?: string;
  sentiment?: SentimentLabel;
  sentimentScore?: number;
}

export interface NewsSentiment {
  overall: SentimentLabel;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageScore: number;
}

export interface WebInsight {
  query: string;
  title: string;
  url: string;
  content: string;
  score?: number;
}
