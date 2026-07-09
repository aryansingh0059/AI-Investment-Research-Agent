'use client';

import type { RiskFactor } from '@/types/recommendation';
import { riskLevelToColor } from '@/lib/utils/formatters';

interface RiskCardProps {
  risks: RiskFactor[];
}

function RiskMeter({ level }: { level: 'low' | 'medium' | 'high' }) {
  const pct = level === 'low' ? 33 : level === 'medium' ? 66 : 100;
  const color = riskLevelToColor(level);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '100px' }}>
      <div
        style={{
          flex: 1,
          height: '4px',
          borderRadius: '2px',
          background: 'var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: '2px',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color,
          textTransform: 'uppercase',
          minWidth: '36px',
          textAlign: 'right',
        }}
      >
        {level}
      </span>
    </div>
  );
}

export default function RiskCard({ risks }: RiskCardProps) {
  if (risks.length === 0) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Risk Assessment</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Risk data unavailable.</p>
      </div>
    );
  }

  const highCount = risks.filter((r) => r.level === 'high').length;
  const mediumCount = risks.filter((r) => r.level === 'medium').length;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600 }}>Risk Assessment Matrix</h2>
        <div style={{ display: 'flex', gap: '6px' }}>
          {highCount > 0 && (
            <span className="badge badge-danger" style={{ fontSize: '10px' }}>{highCount} High Exposure</span>
          )}
          {mediumCount > 0 && (
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>{mediumCount} Moderate</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}
      >
        {risks.map((risk, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: `1px solid var(--border)`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {risk.category}
              </span>
              <RiskMeter level={risk.level} />
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {risk.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
