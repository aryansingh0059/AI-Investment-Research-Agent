export interface CompanyProfile {
  symbol: string;
  name: string;
  logo?: string;
  industry?: string;
  sector?: string;
  ceo?: string;
  headquarters?: string;
  employees?: number;
  website?: string;
  description?: string;
  marketCap?: number;
  currentPrice?: number;
  exchange?: string;
  currency?: string;
  ipo?: string;
  country?: string;
  finnhubIndustry?: string;
}

export interface Competitor {
  symbol: string;
  name?: string;
  marketCap?: number;
  currentPrice?: number;
  peRatio?: number;
  revenueGrowth?: number;
}
