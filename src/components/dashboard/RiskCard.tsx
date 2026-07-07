'use client';

import type { RiskFactor } from '@/types/recommendation';
import { riskLevelToColor } from '@/lib/utils/formatters';

interface RiskCardProps {
  risks: RiskFactor[];
}

function RiskMeter({ level }: { level: 'low' | 'medium' | 'high' }) {
  const pct = level === 'low' ? 30 : level === 'medium' ? 65 : 95;
  const color = riskLevelToColor(level);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
      <div
        style={{
          flex: 1,
          height: '6px',
          borderRadius: '3px',
          background: 'var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: '3px',
            transition: 'width 0.8s ease',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color,
          textTransform: 'capitalize',
          minWidth: '40px',
        }}
      >
        {level}
      </span>
    </div>
  );
}

const RISK_ICONS: Record<string, string> = {
  'Market Risk': '📈',
  'Business Risk': '🏢',
  'Debt Risk': '💳',
  'Regulatory Risk': '⚖️',
  'Competition Risk': '⚡',
  'Geographical Risk': '🌍',
  'Technology Risk': '💻',
};

export default function RiskCard({ risks }: RiskCardProps) {
  if (risks.length === 0) {
    return (
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Risk Analysis</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Risk data unavailable.</p>
      </div>
    );
  }

  const highCount = risks.filter((r) => r.level === 'high').length;
  const mediumCount = risks.filter((r) => r.level === 'medium').length;
  const lowCount = risks.filter((r) => r.level === 'low').length;

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Risk Analysis</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {highCount > 0 && (
            <span className="badge badge-danger">🔴 {highCount} High</span>
          )}
          {mediumCount > 0 && (
            <span className="badge badge-warning">🟡 {mediumCount} Medium</span>
          )}
          {lowCount > 0 && (
            <span className="badge badge-success">🟢 {lowCount} Low</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '12px',
        }}
      >
        {risks.map((risk, i) => (
          <div
            key={i}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: `1px solid ${riskLevelToColor(risk.level)}30`,
              transition: 'border-color 0.2s',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>
                  {RISK_ICONS[risk.category] ?? '⚠️'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {risk.category}
                </span>
              </div>
              <RiskMeter level={risk.level} />
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {risk.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
