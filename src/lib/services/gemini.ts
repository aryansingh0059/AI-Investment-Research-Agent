/**
 * Google Gemini AI service
 * Retries up to 3 times on HTTP 503 with exponential backoff (2s → 4s → 8s)
 * before returning null and triggering the Groq fallback.
 */
import { REQUEST_TIMEOUT } from '@/constants';

const MODEL = 'gemini-2.5-flash';
const API_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const MAX_RETRIES = 3;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateWithGemini(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.2
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[Gemini] API key not configured');
    return null;
  }

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      temperature,
      responseMimeType: 'application/json',
      maxOutputTokens: 4096,
    },
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT * 4),
      });

      if (res.status === 503 || res.status === 429) {
        const waitMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`[Gemini] ${res.status} on attempt ${attempt}/${MAX_RETRIES} — retrying in ${waitMs}ms`);
        if (attempt < MAX_RETRIES) {
          await sleep(waitMs);
          continue;
        }
        console.error(`[Gemini] All retries exhausted on ${res.status} — falling back to Groq`);
        return null;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Gemini] ${res.status}: ${errText}`);
        return null;
      }

      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
    } catch (err) {
      console.error(`[Gemini] Error on attempt ${attempt}:`, err);
      if (attempt === MAX_RETRIES) return null;
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  return null;
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
