/**
 * Financial Modeling Prep (FMP) API service
 * Docs: https://site.financialmodelingprep.com/developer/docs
 */
import { FMP_BASE, REQUEST_TIMEOUT } from '@/constants';
import type { FinancialData, IncomeStatement, BalanceSheet, CashFlow } from '@/types/financial';

async function fmpFetch<T>(path: string): Promise<T | null> {
  const apiKey = process.env.FMP_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[FMP] API key not configured');
    return null;
  }
  try {
    const sep = path.includes('?') ? '&' : '?';
    const url = `${FMP_BASE}${path}${sep}apikey=${apiKey}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[FMP] ${path} returned ${res.status}: ${errText}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[FMP] Error fetching ${path}:`, err);
    return null;
  }
}

interface FMPIncome {
  date: string;
  revenue: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
  eps: number;
  ebitda: number;
}

interface FMPBalance {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  cashAndCashEquivalents: number;
  totalDebt: number;
  shortTermDebt: number;
  longTermDebt: number;
}

interface FMPCashFlow {
  date: string;
  operatingCashFlow: number;
  freeCashFlow: number;
  capitalExpenditure: number;
  dividendsPaid: number;
}

export async function getFinancialData(symbol: string): Promise<FinancialData | null> {
  const [incomeRaw, balanceRaw, cashFlowRaw] = await Promise.all([
    fmpFetch<FMPIncome[]>(`/income-statement/${symbol}?limit=4`),
    fmpFetch<FMPBalance[]>(`/balance-sheet-statement/${symbol}?limit=4`),
    fmpFetch<FMPCashFlow[]>(`/cash-flow-statement/${symbol}?limit=4`),
  ]);

  const incomeStatements: IncomeStatement[] = (incomeRaw ?? []).map((i) => ({
    date: i.date,
    revenue: i.revenue,
    netIncome: i.netIncome,
    grossProfit: i.grossProfit,
    operatingIncome: i.operatingIncome,
    eps: i.eps,
    ebitda: i.ebitda,
  }));

  const balanceSheets: BalanceSheet[] = (balanceRaw ?? []).map((b) => ({
    date: b.date,
    totalAssets: b.totalAssets,
    totalLiabilities: b.totalLiabilities,
    totalEquity: b.totalStockholdersEquity,
    cash: b.cashAndCashEquivalents,
    totalDebt: b.totalDebt,
    shortTermDebt: b.shortTermDebt,
    longTermDebt: b.longTermDebt,
  }));

  const cashFlows: CashFlow[] = (cashFlowRaw ?? []).map((c) => ({
    date: c.date,
    operatingCashFlow: c.operatingCashFlow,
    freeCashFlow: c.freeCashFlow,
    capitalExpenditure: c.capitalExpenditure,
    dividendsPaid: c.dividendsPaid,
  }));

  const latest = incomeStatements[0];
  const latestBalance = balanceSheets[0];
  const latestCash = cashFlows[0];

  return {
    incomeStatements,
    balanceSheets,
    cashFlows,
    metrics: {},
    latestRevenue: latest?.revenue,
    latestNetIncome: latest?.netIncome,
    latestEPS: latest?.eps,
    latestFreeCashFlow: latestCash?.freeCashFlow,
    totalDebt: latestBalance?.totalDebt,
    cash: latestBalance?.cash,
  };
}

interface FMPProfile {
  ceo?: string;
}

export async function getCompanyProfileFromFMP(symbol: string): Promise<{ ceo?: string } | null> {
  const data = await fmpFetch<FMPProfile[]>(`/profile/${symbol}`);
  if (data && data.length > 0) {
    return {
      ceo: data[0].ceo,
    };
  }
  return null;
}
