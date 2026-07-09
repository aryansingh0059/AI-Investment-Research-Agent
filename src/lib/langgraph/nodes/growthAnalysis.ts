import type { GraphState } from '../state';

/**
 * Node 7: Growth Analysis
 * Reworked as a passive graph node to eliminate separate LLM calls.
 * The actual growth catalysts are consolidated in the final decision engine node.
 */
export async function growthAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] growthAnalysis (passive data pass):', state.company);
  return {};
}
