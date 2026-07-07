import type { GraphState } from '../state';
import { getWebInsights } from '@/lib/services/tavily';

/**
 * Node 4: Web Search
 * Uses Tavily to collect web research insights about the company.
 */
export async function webSearchNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] webSearch:', state.company);

  try {
    const webInsights = await getWebInsights(state.company);

    return {
      webInsights,
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
