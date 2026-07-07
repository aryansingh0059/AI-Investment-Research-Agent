'use client';

import type { GrowthFactor } from '@/types/recommendation';
import { impactToColor } from '@/lib/utils/formatters';

interface GrowthCardProps {
  growthFactors: GrowthFactor[];
}

const GROWTH_ICONS: Record<string, string> = {
  'Revenue Growth': '📈',
  'Market Expansion': '🌐',
  Innovation: '💡',
  'AI & Technology Initiatives': '🤖',
  'Strategic Partnerships & Acquisitions': '🤝',
  'Competitive Positioning': '🏆',
};

export default function GrowthCard({ growthFactors }: GrowthCardProps) {
  if (growthFactors.length === 0) {
    return (
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Growth Analysis</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Growth data unavailable.</p>
      </div>
    );
  }

  const highImpact = growthFactors.filter((g) => g.impact === 'high').length;
  const mediumImpact = growthFactors.filter((g) => g.impact === 'medium').length;

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Growth Analysis</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {highImpact > 0 && <span className="badge badge-success">🚀 {highImpact} High Impact</span>}
          {mediumImpact > 0 && <span className="badge badge-brand">⬆️ {mediumImpact} Medium</span>}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {growthFactors.map((factor, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
          >
            <div style={{ fontSize: '20px', flexShrink: 0 }}>
              {GROWTH_ICONS[factor.category] ?? '🚀'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {factor.category}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: impactToColor(factor.impact),
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: `${impactToColor(factor.impact)}20`,
                  }}
                >
                  {factor.impact} impact
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {factor.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
