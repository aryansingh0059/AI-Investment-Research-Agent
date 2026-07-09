import type { GraphState } from '../state';

/**
 * Node 8: SWOT Generator
 * Reworked as a passive graph node to eliminate separate LLM calls.
 * The actual SWOT categories are consolidated in the final decision engine node.
 */
export async function swotGeneratorNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] swotGenerator (passive data pass):', state.company);
  return {};
}
