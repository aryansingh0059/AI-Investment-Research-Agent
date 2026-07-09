import type { GraphState } from '../state';
import { getFinancialData } from '@/lib/services/yahooFinanceService';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

/**
 * Node 2: Financial Analysis
 * Fetches income statements, balance sheets, and cash flow from Yahoo Finance.
 * Always fetches the latest 4 fiscal years sorted chronologically.
 * Produces `financialSummary` string for downstream AI nodes.
 */
export async function financialAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] financialAnalysis:', state.symbol);
  const errors: string[] = [];

  if (!state.symbol) {
    return {
      errors: [...state.errors, 'Financial analysis skipped: no symbol resolved'],
    };
  }

  try {
    const financialData = await getFinancialData(state.symbol);

    if (!financialData || financialData.incomeStatements.length === 0) {
      errors.push('Yahoo Finance returned no financial statements for this symbol.');
      return {
        financialData: {
          incomeStatements: [],
          balanceSheets: [],
          cashFlows: [],
          metrics: {},
        },
        dataQuality: { ...state.dataQuality, hasFinancialData: false },
        errors: [...state.errors, ...errors],
      };
    }

    const m = financialData.metrics;
    const { latestRevenue, latestNetIncome, latestEPS, latestFreeCashFlow, totalDebt, cash } = financialData;

    // ── Build compact financialSummary for AI prompts ────────────────────────
    const financialSummary = [
      `Revenue: ${formatCurrency(latestRevenue)}`,
      `Net Income: ${formatCurrency(latestNetIncome)}`,
      `EPS: ${latestEPS != null ? `$${latestEPS.toFixed(2)}` : 'N/A'}`,
      `Free Cash Flow: ${formatCurrency(latestFreeCashFlow)}`,
      `Cash: ${formatCurrency(cash)}`,
      `Total Debt: ${formatCurrency(totalDebt)}`,
      m.peRatio != null ? `P/E: ${m.peRatio.toFixed(1)}` : '',
      m.revenueGrowthYoy != null ? `Revenue Growth YoY: ${formatPercent(m.revenueGrowthYoy)}` : '',
      m.netMargin != null ? `Net Margin: ${formatPercent(m.netMargin)}` : '',
      m.operatingMargin != null ? `Op Margin: ${formatPercent(m.operatingMargin)}` : '',
      m.roe != null ? `ROE: ${formatPercent(m.roe)}` : '',
      m.roa != null ? `ROA: ${formatPercent(m.roa)}` : '',
      m.debtToEquity != null ? `D/E: ${m.debtToEquity.toFixed(2)}` : '',
      m.currentRatio != null ? `Current Ratio: ${m.currentRatio.toFixed(2)}` : '',
      m.dividendYield != null ? `Dividend Yield: ${formatPercent(m.dividendYield)}` : '',
      m.beta != null ? `Beta: ${m.beta.toFixed(2)}` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    console.log(`[Node] financialAnalysis: fetched ${financialData.incomeStatements.length} years of data`);

    return {
      financialData,
      financialSummary,
      dataQuality: {
        ...state.dataQuality,
        hasFinancialData: financialData.incomeStatements.length > 0,
      },
      errors: [...state.errors, ...errors],
    };
  } catch (err) {
    const msg = `Financial analysis failed: ${String(err)}`;
    console.error('[Node] financialAnalysis error:', err);
    return { errors: [...state.errors, msg] };
  }
}
