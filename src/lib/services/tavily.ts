/**
 * Tavily AI Search service
 * Docs: https://docs.tavily.com
 */
import { TAVILY_BASE, REQUEST_TIMEOUT, TAVILY_SEARCH_QUERIES } from '@/constants';
import type { WebInsight } from '@/types/news';

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
}

async function searchTavily(query: string): Promise<WebInsight[]> {
  const apiKey = process.env.TAVILY_API_KEY ?? '';
  if (!apiKey) return [];
  try {
    const res = await fetch(`${TAVILY_BASE}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'basic',
        max_results: 3,
        include_answer: false,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!res.ok) {
      console.warn(`[Tavily] query "${query}" returned ${res.status}`);
      return [];
    }
    const data = (await res.json()) as { results?: TavilyResult[] };
    return (data.results ?? []).map((r) => ({
      query,
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
    }));
  } catch (err) {
    console.error('[Tavily] Error:', err);
    return [];
  }
}

export async function getWebInsights(company: string): Promise<WebInsight[]> {
  const apiKey = process.env.TAVILY_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[Tavily] API key not configured');
    return [];
  }
  const queries = TAVILY_SEARCH_QUERIES(company);
  // Run searches in parallel (batches of 3 to avoid rate limiting)
  const batch1 = queries.slice(0, 3);
  const batch2 = queries.slice(3);
  const [r1, r2] = await Promise.all([
    Promise.all(batch1.map(searchTavily)),
    Promise.all(batch2.map(searchTavily)),
  ]);
  return [...r1, ...r2].flat();
}
