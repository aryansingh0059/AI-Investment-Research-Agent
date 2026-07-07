/**
 * Google Gemini AI service
 */
import { REQUEST_TIMEOUT } from '@/constants';

const MODEL = 'gemini-2.5-flash';
const API_BASE = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

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
  try {
    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
        maxOutputTokens: 8192,
      },
    };

    const res = await fetch(`${API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT * 4),
    });

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
    console.error('[Gemini] Error:', err);
    return null;
  }
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
