/**
 * Unified AI service — Gemini (primary) → Groq (fallback)
 *
 * All LangGraph nodes should import `generateWithAI` from here
 * instead of calling Gemini or Groq directly.
 *
 * Fallback logic:
 *  1. Try Gemini (gemini-1.5-flash)
 *  2. If Gemini fails or is unconfigured → try Groq (llama-3.3-70b-versatile)
 *  3. If both fail → return null (nodes handle the null case with rule-based fallbacks)
 */
import { generateWithGemini, isGeminiConfigured } from './gemini';
import { generateWithGroq, isGroqConfigured } from './groq';

export type AIProvider = 'gemini' | 'groq' | 'none';

export interface AIResult {
  text: string;
  provider: AIProvider;
}

/**
 * Generate text with Gemini as primary and Groq as fallback.
 * Returns null if both providers fail or are unconfigured.
 */
export async function generateWithAI(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.2
): Promise<AIResult | null> {
  // ── Primary: Gemini ──────────────────────────────────────────
  if (isGeminiConfigured()) {
    const result = await generateWithGemini(systemPrompt, userMessage, temperature);
    if (result) {
      return { text: result, provider: 'gemini' };
    }
    console.warn('[AI] Gemini failed or returned null — falling back to Groq');
  } else {
    console.warn('[AI] Gemini not configured — trying Groq');
  }

  // ── Fallback: Groq ───────────────────────────────────────────
  if (isGroqConfigured()) {
    const result = await generateWithGroq(systemPrompt, userMessage, temperature);
    if (result) {
      return { text: result, provider: 'groq' };
    }
    console.warn('[AI] Groq also failed or returned null');
  } else {
    console.warn('[AI] Groq not configured either');
  }

  return null;
}

/**
 * Returns which AI providers are currently configured.
 * Useful for logging/debugging in nodes.
 */
export function getActiveProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (isGeminiConfigured()) providers.push('gemini');
  if (isGroqConfigured()) providers.push('groq');
  return providers;
}
