export interface IncomeStatement {
  date: string;
  revenue: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
  eps: number;
  ebitda: number;
}

export interface BalanceSheet {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  cash: number;
  totalDebt: number;
  shortTermDebt: number;
  longTermDebt: number;
}

export interface CashFlow {
  date: string;
  operatingCashFlow: number;
  freeCashFlow: number;
  capitalExpenditure: number;
  dividendsPaid?: number;
}

export interface FinancialMetrics {
  peRatio?: number;
  pbRatio?: number;
  psRatio?: number;
  evToEbitda?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
  roe?: number;
  roa?: number;
  roic?: number;
  operatingMargin?: number;
  netMargin?: number;
  grossMargin?: number;
  revenueGrowthYoy?: number;
  earningsGrowthYoy?: number;
  dividendYield?: number;
  payoutRatio?: number;
  beta?: number;
  week52High?: number;
  week52Low?: number;
}

export interface FinancialData {
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlow[];
  metrics: FinancialMetrics;
  latestRevenue?: number;
  latestNetIncome?: number;
  latestEPS?: number;
  latestFreeCashFlow?: number;
  totalDebt?: number;
  cash?: number;
}
