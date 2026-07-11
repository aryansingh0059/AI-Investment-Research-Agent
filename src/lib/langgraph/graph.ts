/**
 * LangGraph state machine for investment analysis.
 * Runs sequentially: Validator → Company → Financial → News → Web → Competitors → Risk → Growth → SWOT → Decision
 *
 * IMPORTANT: companyValidatorNode runs first as a hard gate.
 * If it sets state.companyValid = false, the entire pipeline is aborted immediately.
 * No AI services, financial fetches, or analysis nodes are called.
 */
import { createInitialState, type GraphState } from './state';
import { companyValidatorNode } from './nodes/companyValidator';
import { companyResearchNode } from './nodes/companyResearch';
import { financialAnalysisNode } from './nodes/financialAnalysis';
import { newsAnalysisNode } from './nodes/newsAnalysis';
import { webSearchNode } from './nodes/webSearch';
import { competitorAnalysisNode } from './nodes/competitorAnalysis';
import { riskAnalysisNode } from './nodes/riskAnalysis';
import { growthAnalysisNode } from './nodes/growthAnalysis';
import { swotGeneratorNode } from './nodes/swotGenerator';
import { decisionEngineNode } from './nodes/decisionEngine';
import type { AnalysisStep } from '@/types/recommendation';

export type ProgressCallback = (step: AnalysisStep, message: string, partialState: Partial<GraphState>) => void;

/**
 * Runs the full investment analysis pipeline.
 * Each node's output is merged into the shared state before the next node runs.
 * Returns early (with companyValid = false) if company validation fails.
 */
export async function runAnalysis(
  company: string,
  onProgress?: ProgressCallback
): Promise<GraphState> {
  let state: GraphState = createInitialState(company);

  const emit = (step: AnalysisStep, message: string) => {
    onProgress?.(step, message, state);
  };

  // Helper to merge node output into state
  const applyUpdate = (update: Partial<GraphState>) => {
    state = { ...state, ...update };
  };

  // ── GATE: Validate company existence before ANY analysis ─────────────────
  emit('company_research', 'Validating company...');
  applyUpdate(await companyValidatorNode(state));

  if (!state.companyValid) {
    // Hard stop — do not call Gemini, Groq, SWOT, risk, or decision engine
    console.log(`[Graph] Company validation failed for "${company}" — aborting pipeline`);
    return state;
  }

  // ── PIPELINE: Company exists — proceed with full analysis ────────────────
  emit('company_research', 'Researching company profile...');
  applyUpdate(await companyResearchNode(state));

  emit('financial_analysis', 'Fetching financial statements...');
  applyUpdate(await financialAnalysisNode(state));

  // Run news + web search in parallel (independent)
  emit('news_analysis', 'Reading latest news...');
  emit('web_search', 'Searching the web for insights...');
  const [newsUpdate, webUpdate] = await Promise.all([
    newsAnalysisNode(state),
    webSearchNode(state),
  ]);
  applyUpdate(newsUpdate);
  applyUpdate(webUpdate);

  emit('competitor_analysis', 'Analyzing competitors...');
  applyUpdate(await competitorAnalysisNode(state));

  // Risk and growth analysis can run in parallel (both read from state, don't depend on each other)
  emit('risk_analysis', 'Assessing investment risks...');
  emit('growth_analysis', 'Evaluating growth prospects...');
  const [riskUpdate, growthUpdate] = await Promise.all([
    riskAnalysisNode(state),
    growthAnalysisNode(state),
  ]);
  applyUpdate(riskUpdate);
  applyUpdate(growthUpdate);

  emit('swot_generation', 'Generating SWOT analysis...');
  applyUpdate(await swotGeneratorNode(state));

  emit('decision_engine', 'AI making investment decision...');
  applyUpdate(await decisionEngineNode(state));

  emit('complete', 'Analysis complete!');
  return state;
}
