import type { GraphState } from '../state';
import { getWebInsights } from '@/lib/services/tavily';

/**
 * Node 4: Web Search
 * Uses Tavily to collect web research insights about the company.
 * Produces `webSummary` string (top 3 results) for downstream AI nodes.
 */
export async function webSearchNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] webSearch:', state.company);

  try {
    const webInsights = await getWebInsights(state.company);

    // ── Build compact webSummary for AI prompts ──────────────────────────────
    const top3 = webInsights.slice(0, 3);
    const webSummary =
      top3.length > 0
        ? top3
            .map((w) => `• ${w.title} (${w.url}): ${w.content.slice(0, 80)}`)
            .join('\n')
        : 'No web search results available.';

    return {
      webInsights,
      webSummary,
      dataQuality: {
        ...state.dataQuality,
        hasWebInsights: webInsights.length > 0,
      },
      errors: [...state.errors],
    };
  } catch (err) {
    const msg = `Web search failed: ${String(err)}`;
    console.error('[Node] webSearch error:', err);
    return { errors: [...state.errors, msg] };
  }
}
