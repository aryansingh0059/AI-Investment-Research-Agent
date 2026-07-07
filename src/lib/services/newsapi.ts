/**
 * NewsAPI service
 * Docs: https://newsapi.org/docs
 */
import { NEWSAPI_BASE, REQUEST_TIMEOUT } from '@/constants';
import type { NewsArticle } from '@/types/news';

export async function getCompanyNews(company: string, pageSize = 8): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY ?? '';
  if (!apiKey) {
    console.warn('[NewsAPI] API key not configured');
    return [];
  }
  try {
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const params = new URLSearchParams({
      q: `"${company}"`,
      sortBy: 'publishedAt',
      pageSize: String(pageSize),
      language: 'en',
      from,
      apiKey,
    });
    const res = await fetch(`${NEWSAPI_BASE}/everything?${params}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.warn(`[NewsAPI] returned ${res.status}`);
      return [];
    }
    const data = (await res.json()) as { articles?: Array<{
      title: string;
      source: { name: string };
      publishedAt: string;
      url: string;
      description?: string;
      content?: string;
    }> };

    return (data.articles ?? [])
      .filter((a) => a.title && a.title !== '[Removed]')
      .slice(0, pageSize)
      .map((a) => ({
        title: a.title,
        source: a.source?.name ?? 'Unknown',
        publishedAt: a.publishedAt,
        url: a.url,
        description: a.description ?? undefined,
        content: a.content ?? undefined,
      }));
  } catch (err) {
    console.error('[NewsAPI] Error:', err);
    return [];
  }
}
