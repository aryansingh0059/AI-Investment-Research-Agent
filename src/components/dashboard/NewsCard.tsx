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
    <span className={`badge ${config.cls}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function NewsCard({ news, sentiment }: NewsCardProps) {
  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Latest News</h2>
        {sentiment && (
          <div
            style={{
              display: 'flex', gap: '8px', alignItems: 'center',
              padding: '6px 12px', borderRadius: '8px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              fontSize: '12px', color: 'var(--text-secondary)',
            }}
          >
            Overall: <SentimentBadge sentiment={sentiment.overall} />
          </div>
        )}
      </div>

      {/* Sentiment bar */}
      {sentiment && sentiment.positiveCount + sentiment.negativeCount + sentiment.neutralCount > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              height: '6px',
              borderRadius: '4px',
              overflow: 'hidden',
              background: 'var(--bg-surface)',
            }}
          >
            {(() => {
              const total = sentiment.positiveCount + sentiment.negativeCount + sentiment.neutralCount;
              return (
                <>
                  <div style={{ width: `${(sentiment.positiveCount / total) * 100}%`, background: 'var(--success)', transition: 'width 0.8s ease' }} />
                  <div style={{ width: `${(sentiment.neutralCount / total) * 100}%`, background: 'var(--neutral)', transition: 'width 0.8s ease' }} />
                  <div style={{ width: `${(sentiment.negativeCount / total) * 100}%`, background: 'var(--danger)', transition: 'width 0.8s ease' }} />
                </>
              );
            })()}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            <span>✅ {sentiment.positiveCount} positive</span>
            <span>➖ {sentiment.neutralCount} neutral</span>
            <span>❌ {sentiment.negativeCount} negative</span>
          </div>
        </div>
      )}

      {news.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          No recent news available. Add NEWS_API_KEY to enable.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {news.slice(0, 6).map((article, i) => (
            <div
              key={i}
              style={{
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
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
                      fontWeight: 600,
                      lineHeight: '1.4',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    {article.title}
                  </a>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{article.source}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(article.publishedAt)}</span>
                    <SentimentBadge sentiment={article.sentiment} />
                  </div>
                  {article.description && (
                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {truncateText(article.description, 120)}
                    </p>
                  )}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
