/**
 * Groq API service (OpenAI-compatible)
 * Docs: https://console.groq.com/docs/openai
 * Used as fallback when Gemini is unavailable or fails.
 *
 * Model: llama-3.3-70b-versatile — best quality within free-tier limits.
 * Max output tokens: 2048 to stay safely below Groq's free-tier limits.
 */
import { REQUEST_TIMEOUT } from '@/constants';

const BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function generateWithGroq(
  systemPrompt: string,
  userMessage: string,
  temperature = 0.2
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[Groq] API key not configured');
    return null;
  }

  try {
    const body = {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
    };

    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT * 3),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Groq] ${res.status}: ${errText}`);
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error('[Groq] Error:', err);
    return null;
  }
}

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
