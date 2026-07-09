import type { GraphState } from '../state';

/**
 * Node 6: Risk Analysis
 * Reworked as a passive graph node to eliminate separate LLM calls.
 * The actual risk assessment is consolidated in the final decision engine node.
 */
export async function riskAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] riskAnalysis (passive data pass):', state.company);
  return {};
}
