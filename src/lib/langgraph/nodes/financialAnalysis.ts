import type { GraphState } from '../state';
import { getFinancialData } from '@/lib/services/fmp';
import { getFinancialMetrics } from '@/lib/services/finnhub';
import { generateWithAI } from '@/lib/services/ai';
import type { FinancialData } from '@/types/financial';

/**
 * Node 2: Financial Analysis
 * Fetches income statement, balance sheet, cash flow from FMP
 * and financial ratios from Finnhub.
 * Falls back to AI financial lookup if FMP API returns 403/errors.
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
    let [financialData, metrics] = await Promise.all([
      getFinancialData(state.symbol),
      getFinancialMetrics(state.symbol),
    ]);

    // Check if FMP failed (indicated by empty statement arrays due to 403 or other API errors)
    const isFmpUnavailable = !financialData || financialData.incomeStatements.length === 0;

    if (isFmpUnavailable) {
      console.log('[Node] financialAnalysis: FMP returned empty or failed. Resolving via AI...');
      errors.push('FMP API returned 403/Forbidden. Using AI-based financial data lookup fallback.');

      try {
        const companyName = state.companyProfile?.name ?? state.company;
        const prompt = `Retrieve the annual financial statements for "${companyName}" (ticker: ${state.symbol}) for the last 3 fiscal years (e.g. 2024, 2023, 2022).
Provide values in standard numbers (not strings, and not abbreviated - e.g. use 383930000000 instead of "383.93B").
Make sure values like revenue, netIncome, and freeCashFlow are accurate.

Return ONLY a JSON object with this exact structure:
{
  "incomeStatements": [
    {
      "date": "YYYY-MM-DD",
      "revenue": number,
      "netIncome": number,
      "grossProfit": number,
      "operatingIncome": number,
      "eps": number,
      "ebitda": number
    }
  ],
  "balanceSheets": [
    {
      "date": "YYYY-MM-DD",
      "totalAssets": number,
      "totalLiabilities": number,
      "totalEquity": number,
      "cash": number,
      "totalDebt": number,
      "shortTermDebt": number,
      "longTermDebt": number
    }
  ],
  "cashFlows": [
    {
      "date": "YYYY-MM-DD",
      "operatingCashFlow": number,
      "freeCashFlow": number,
      "capitalExpenditure": number,
      "dividendsPaid": number
    }
  ]
}`;

        const aiResult = await generateWithAI(
          'You are a professional financial analyst. Return JSON only.',
          prompt,
          0.1
        );

        if (aiResult && aiResult.text.trim()) {
          let cleaned = aiResult.text.trim();
          if (cleaned.includes('```')) {
            cleaned = cleaned.replace(/```json|```/g, '').trim();
          }
          const parsed = JSON.parse(cleaned);
          
          if (parsed && Array.isArray(parsed.incomeStatements) && parsed.incomeStatements.length > 0) {
            const latestInc = parsed.incomeStatements[0];
            const latestBal = parsed.balanceSheets?.[0];
            const latestCF = parsed.cashFlows?.[0];

            financialData = {
              incomeStatements: parsed.incomeStatements,
              balanceSheets: parsed.balanceSheets || [],
              cashFlows: parsed.cashFlows || [],
              metrics: {},
              latestRevenue: latestInc?.revenue || undefined,
              latestNetIncome: latestInc?.netIncome || undefined,
              latestEPS: latestInc?.eps || undefined,
              latestFreeCashFlow: latestCF?.freeCashFlow || undefined,
              totalDebt: latestBal?.totalDebt || undefined,
              cash: latestBal?.cash || undefined,
            };
            console.log('[Node] financialAnalysis: Successfully resolved financial statements via AI.');
          }
        }
      } catch (aiErr) {
        console.error('Failed to resolve financial statements via AI:', aiErr);
        errors.push(`AI financial lookup failed: ${String(aiErr)}`);
      }
    }

    if (!financialData) {
      financialData = {
        incomeStatements: [],
        balanceSheets: [],
        cashFlows: [],
        metrics: {},
      };
    }

    // Merge Finnhub metrics into financial data
    const mergedData = {
      ...financialData,
      metrics: { ...financialData.metrics, ...metrics },
    };

    return {
      financialData: mergedData,
      dataQuality: { 
        ...state.dataQuality, 
        hasFinancialData: mergedData.incomeStatements.length > 0 
      },
      errors: [...state.errors, ...errors],
    };
  } catch (err) {
    const msg = `Financial analysis failed: ${String(err)}`;
    console.error('[Node] financialAnalysis error:', err);
    return { errors: [...state.errors, msg] };
  }
}
