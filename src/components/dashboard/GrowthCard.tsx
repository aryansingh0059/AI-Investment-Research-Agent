'use client';

import type { GrowthFactor } from '@/types/recommendation';
import { impactToColor } from '@/lib/utils/formatters';

interface GrowthCardProps {
  growthFactors: GrowthFactor[];
}

export default function GrowthCard({ growthFactors }: GrowthCardProps) {
  if (growthFactors.length === 0) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Growth Catalysts</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Growth data unavailable.</p>
      </div>
    );
  }

  const highImpact = growthFactors.filter((g) => g.impact === 'high').length;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Growth Drivers</h2>
        {highImpact > 0 && (
          <span className="badge badge-success" style={{ fontSize: '10px' }}>
            {highImpact} High Impact Catalysts
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {growthFactors.map((factor, i) => (
          <div
            key={i}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {factor.category}
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    color: impactToColor(factor.impact),
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: 'var(--bg-base)',
                    border: `1px solid ${impactToColor(factor.impact)}30`,
                  }}
                >
                  {factor.impact}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {factor.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
