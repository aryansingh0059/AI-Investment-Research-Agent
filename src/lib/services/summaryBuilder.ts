/**
 * Summary Builder Service
 * Prepares a highly compacted, structured JSON payload from the raw data in GraphState.
 * Keeps the total input token count under 1500-2000 tokens.
 */
import type { GraphState } from '../langgraph/state';

export interface CompactPayload {
  company: {
    name?: string;
    symbol?: string;
    sector?: string;
    industry?: string;
    marketCap?: number;
    price?: number;
    employees?: number;
    country?: string;
    exchange?: string;
  };
  financials: {
    metrics: {
      peRatio?: number;
      pbRatio?: number;
      debtToEquity?: number;
      currentRatio?: number;
      roe?: number;
      roa?: number;
      operatingMargin?: number;
      netMargin?: number;
      grossMargin?: number;
      dividendYield?: number;
      beta?: number;
      revenueGrowthYoy?: number;
      earningsGrowthYoy?: number;
    };
    statements: Array<{
      date: string;
      revenue: number;
      netIncome: number;
      operatingCF: number;
      freeCF: number;
      totalAssets: number;
      totalLiab: number;
      totalEquity: number;
      totalDebt: number;
    }>;
  };
  news: Array<{
    title: string;
    source: string;
    sentiment?: string;
  }>;
  search: Array<{
    title: string;
    snippet: string;
  }>;
  competitors: Array<{
    symbol: string;
    name?: string;
    marketCap?: number;
    peRatio?: number;
  }>;
}

export function buildCompactPayload(state: GraphState): CompactPayload {
  const profile = state.companyProfile;
  const fd = state.financialData;

  // 1. Map profile
  const company = {
    name: profile?.name ?? state.company,
    symbol: profile?.symbol ?? state.symbol,
    sector: profile?.sector,
    industry: profile?.industry,
    marketCap: profile?.marketCap,
    price: profile?.currentPrice,
    employees: profile?.employees,
    country: profile?.country,
    exchange: profile?.exchange,
  };

  // 2. Map financials (chronological annual statement columns)
  const statements: CompactPayload['financials']['statements'] = [];
  if (fd?.incomeStatements) {
    fd.incomeStatements.forEach((inc, idx) => {
      const bal = fd.balanceSheets?.[idx];
      const cf = fd.cashFlows?.[idx];
      statements.push({
        date: inc.date,
        revenue: inc.revenue,
        netIncome: inc.netIncome,
        operatingCF: cf?.operatingCashFlow ?? 0,
        freeCF: cf?.freeCashFlow ?? 0,
        totalAssets: bal?.totalAssets ?? 0,
        totalLiab: bal?.totalLiabilities ?? 0,
        totalEquity: bal?.totalEquity ?? 0,
        totalDebt: bal?.totalDebt ?? 0,
      });
    });
  }

  const financials = {
    metrics: {
      peRatio: fd?.metrics?.peRatio,
      pbRatio: fd?.metrics?.pbRatio,
      debtToEquity: fd?.metrics?.debtToEquity,
      currentRatio: fd?.metrics?.currentRatio,
      roe: fd?.metrics?.roe,
      roa: fd?.metrics?.roa,
      operatingMargin: fd?.metrics?.operatingMargin,
      netMargin: fd?.metrics?.netMargin,
      grossMargin: fd?.metrics?.grossMargin,
      dividendYield: fd?.metrics?.dividendYield,
      beta: fd?.metrics?.beta,
      revenueGrowthYoy: fd?.metrics?.revenueGrowthYoy,
      earningsGrowthYoy: fd?.metrics?.earningsGrowthYoy,
    },
    statements,
  };

  // 3. Map news (latest 5 headlines only)
  const news = (state.news ?? [])
    .slice(0, 5)
    .map((item) => ({
      title: item.title,
      source: item.source,
      sentiment: item.sentiment,
    }));

  // 4. Map search insights (top 3 summaries only)
  const search = (state.webInsights ?? [])
    .slice(0, 3)
    .map((item) => ({
      title: item.title,
      snippet: item.content ? item.content.slice(0, 150) : '',
    }));

  // 5. Map competitors
  const competitors = (state.competitors ?? [])
    .slice(0, 5)
    .map((comp) => ({
      symbol: comp.symbol,
      name: comp.name,
      marketCap: comp.marketCap,
      peRatio: comp.peRatio,
    }));

  return {
    company,
    financials,
    news,
    search,
    competitors,
  };
}
