import type { GraphState } from '../state';
import { getCompanyNews } from '@/lib/services/newsapi';
import type { NewsArticle, NewsSentiment, SentimentLabel } from '@/types/news';

/** Simple lexicon-based sentiment scorer */
function scoreSentiment(text: string): { label: SentimentLabel; score: number } {
  const positive = [
    'growth', 'profit', 'revenue', 'beat', 'strong', 'record', 'launch', 'partnership',
    'acquisition', 'innovation', 'upgrade', 'bullish', 'surge', 'rally', 'outperform',
    'dividend', 'expand', 'win', 'success', 'gain', 'rise', 'breakthrough',
  ];
  const negative = [
    'loss', 'decline', 'miss', 'weak', 'cut', 'layoff', 'lawsuit', 'investigation',
    'fraud', 'recall', 'fine', 'penalty', 'bearish', 'drop', 'crash', 'downgrade',
    'concern', 'risk', 'debt', 'bankruptcy', 'fail', 'fall', 'problem', 'scandal',
  ];

  const lower = text.toLowerCase();
  let score = 0;
  positive.forEach((w) => { if (lower.includes(w)) score += 1; });
  negative.forEach((w) => { if (lower.includes(w)) score -= 1; });

  const maxWords = Math.max(positive.length, negative.length);
  const normalized = Math.max(-1, Math.min(1, score / (maxWords * 0.3)));
  const label: SentimentLabel =
    normalized > 0.1 ? 'positive' : normalized < -0.1 ? 'negative' : 'neutral';

  return { label, score: normalized };
}

/**
 * Node 3: News Analysis
 * Fetches top 5 news articles and scores sentiment.
 * Produces `newsSummary` string for downstream AI nodes.
 */
export async function newsAnalysisNode(
  state: GraphState
): Promise<Partial<GraphState>> {
  console.log('[Node] newsAnalysis:', state.company);

  try {
    // Only fetch top 5 articles — enough context, much fewer tokens
    const rawArticles = await getCompanyNews(state.company, 5);

    const articles: NewsArticle[] = rawArticles.map((a) => {
      const text = `${a.title} ${a.description ?? ''}`;
      const { label, score } = scoreSentiment(text);
      return { ...a, sentiment: label, sentimentScore: score };
    });

    // Aggregate sentiment
    const positiveCount = articles.filter((a) => a.sentiment === 'positive').length;
    const negativeCount = articles.filter((a) => a.sentiment === 'negative').length;
    const neutralCount = articles.length - positiveCount - negativeCount;
    const averageScore =
      articles.length > 0
        ? articles.reduce((sum, a) => sum + (a.sentimentScore ?? 0), 0) / articles.length
        : 0;

    const overall: SentimentLabel =
      averageScore > 0.05 ? 'positive' : averageScore < -0.05 ? 'negative' : 'neutral';

    const newsSentiment: NewsSentiment = {
      overall,
      positiveCount,
      neutralCount,
      negativeCount,
      averageScore,
    };

    // ── Build compact newsSummary for AI prompts ─────────────────────────────
    const newsSummary =
      articles.length > 0
        ? articles
            .map(
              (a) =>
                `• [${(a.sentiment ?? 'neutral').toUpperCase()}] ${a.title} (${a.source})`
            )
            .join('\n')
        : 'No recent news available.';

    return {
      news: articles,
      newsSentiment,
      newsSummary,
      dataQuality: { ...state.dataQuality, hasNews: articles.length > 0 },
      errors: [...state.errors],
    };
  } catch (err) {
    const msg = `News analysis failed: ${String(err)}`;
    console.error('[Node] newsAnalysis error:', err);
    return { errors: [...state.errors, msg] };
  }
}
