import type { GraphState } from '../state';
import { resolveSymbol, validateCompany } from '@/lib/services/yahooFinanceService';
import { resolveSymbolFallback } from '@/lib/services/finnhub';

/**
 * Detects whether an error is a network-level failure (SSL, DNS, connection refused)
 * rather than a logical "not found" result.
 * Network failures should NOT block the pipeline — they're infrastructure issues,
 * not a signal that the company doesn't exist.
 */
function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('fetch failed') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('etimedout') ||
    msg.includes('self_signed_cert') ||
    msg.includes('certificate') ||
    msg.includes('network') ||
    (err as NodeJS.ErrnoException).code === 'SELF_SIGNED_CERT_IN_CHAIN' ||
    (err as NodeJS.ErrnoException).code === 'ECONNREFUSED' ||
    (err as NodeJS.ErrnoException).code === 'ENOTFOUND'
  );
}

/**
 * Node 0: Company Validator (pre-flight gate)
 *
 * Runs FIRST in the pipeline — before any AI calls, financial fetches, or
 * downstream nodes. If this node sets companyValid = false, the graph
 * orchestrator immediately returns and skips every subsequent node.
 *
 * Validation criteria (all must pass):
 *  1. A ticker symbol can be resolved via Yahoo Finance or Finnhub fallback.
 *  2. Yahoo Finance quoteType === "EQUITY" (rejects ETFs, crypto, indices).
 *  3. Company name is present.
 *  4. Exchange information is present.
 *
 * Network failures (SSL errors, timeouts, DNS failures) are treated as
 * "unable to validate" and allow the pipeline through — they are NOT treated
 * as "company not found".
 */
export async function companyValidatorNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] companyValidator:', state.company);

  try {
    // ── Step 1: Resolve ticker symbol ─────────────────────────────────────
    let symbol: string | null = null;
    let symbolResolutionNetworkError = false;

    try {
      symbol = await resolveSymbol(state.company);
    } catch (err) {
      if (isNetworkError(err)) {
        console.warn('[Node] companyValidator: Network error during symbol resolution — pipeline will proceed');
        symbolResolutionNetworkError = true;
      } else {
        throw err;
      }
    }

    if (!symbol && !symbolResolutionNetworkError) {
      // Yahoo Finance returned null (not a network error) — try Finnhub fallback
      console.log('[Node] companyValidator: Yahoo Finance symbol lookup returned null — trying Finnhub fallback');
      try {
        symbol = await resolveSymbolFallback(state.company);
      } catch (err) {
        if (isNetworkError(err)) {
          console.warn('[Node] companyValidator: Network error in Finnhub fallback — pipeline will proceed');
          symbolResolutionNetworkError = true;
        } else {
          throw err;
        }
      }
    }

    // If both lookups returned null (not due to network errors), company doesn't exist
    if (!symbol && !symbolResolutionNetworkError) {
      console.log(`[Node] companyValidator: No ticker found for "${state.company}" — blocking pipeline`);
      return {
        companyValid: false,
        validationError: `No publicly listed company was found matching "${state.company}". Please verify the spelling or try a valid ticker symbol.`,
        errors: [...state.errors],
      };
    }

    // If we couldn't resolve due to network failure, let the pipeline proceed
    // (downstream nodes will handle further errors gracefully)
    if (!symbol && symbolResolutionNetworkError) {
      console.warn('[Node] companyValidator: Could not validate due to network issues — allowing pipeline through');
      return {
        companyValid: true,
        errors: [...state.errors],
      };
    }

    // ── Step 2: Validate the resolved symbol is a real public equity ──────
    try {
      const validation = await validateCompany(symbol!);

      if (!validation.valid) {
        console.log(`[Node] companyValidator: Validation failed for "${symbol}": ${validation.reason}`);
        return {
          companyValid: false,
          symbol: symbol!,
          validationError: `"${state.company}" does not appear to be a publicly listed company. ${validation.reason ?? ''}`.trim(),
          errors: [...state.errors],
        };
      }

      // ── Step 3: All checks passed — allow pipeline to proceed ──────────
      console.log(`[Node] companyValidator: "${symbol}" passed validation (${validation.name}, ${validation.exchange})`);
      return {
        companyValid: true,
        symbol: symbol!,
        errors: [...state.errors],
      };
    } catch (err) {
      if (isNetworkError(err)) {
        // Can't validate but symbol resolved — let pipeline through
        console.warn(`[Node] companyValidator: Network error during validation of "${symbol}" — allowing pipeline through`);
        return {
          companyValid: true,
          symbol: symbol!,
          errors: [...state.errors],
        };
      }
      throw err;
    }
  } catch (err) {
    const msg = `Company validation failed: ${String(err)}`;
    console.error('[Node] companyValidator error:', err);
    return {
      companyValid: false,
      validationError: 'An error occurred while validating the company. Please try again.',
      errors: [...state.errors, msg],
    };
  }
}
