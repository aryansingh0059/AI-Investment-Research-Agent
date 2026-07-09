'use client';

import type { NewsArticle, NewsSentiment } from '@/types/news';
import { formatDate, truncateText } from '@/lib/utils/formatters';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface NewsCardProps {
  news: NewsArticle[];
  sentiment?: NewsSentiment;
}

function SentimentBadge({ sentiment }: { sentiment?: string }) {
  if (!sentiment) return null;
  const config = {
    positive: { cls: 'badge-success', icon: <TrendingUp size={10} />, label: 'Positive' },
    negative: { cls: 'badge-danger', icon: <TrendingDown size={10} />, label: 'Negative' },
    neutral: { cls: 'badge-neutral', icon: <Minus size={10} />, label: 'Neutral' },
  }[sentiment] ?? { cls: 'badge-neutral', icon: null, label: sentiment };

  return (
    <span className={`badge ${config.cls}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function NewsCard({ news, sentiment }: NewsCardProps) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Market News Sentiment</h2>
        {sentiment && (
          <div
            style={{
              display: 'flex', gap: '6px', alignItems: 'center',
              padding: '4px 8px', borderRadius: '4px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontSize: '11px', color: 'var(--text-secondary)',
            }}
          >
            Sentiment: <SentimentBadge sentiment={sentiment.overall} />
          </div>
        )}
      </div>

      {/* Sentiment ratio bar */}
      {sentiment && sentiment.positiveCount + sentiment.negativeCount + sentiment.neutralCount > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="progress-container">
            {(() => {
              const total = sentiment.positiveCount + sentiment.negativeCount + sentiment.neutralCount;
              return (
                <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                  <div style={{ width: `${(sentiment.positiveCount / total) * 100}%`, background: 'var(--success)' }} />
                  <div style={{ width: `${(sentiment.neutralCount / total) * 100}%`, background: 'var(--neutral)' }} />
                  <div style={{ width: `${(sentiment.negativeCount / total) * 100}%`, background: 'var(--danger)' }} />
                </div>
              );
            })()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            <span>{sentiment.positiveCount} POSITIVE</span>
            <span>{sentiment.neutralCount} NEUTRAL</span>
            <span>{sentiment.negativeCount} NEGATIVE</span>
          </div>
        </div>
      )}

      {news.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          No recent news available.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {news.slice(0, 5).map((article, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 500,
                      lineHeight: '1.4',
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {article.title}
                  </a>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{article.source}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{formatDate(article.publishedAt)}</span>
                    <SentimentBadge sentiment={article.sentiment} />
                  </div>
                  {article.description && (
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {truncateText(article.description, 100)}
                    </p>
                  )}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
