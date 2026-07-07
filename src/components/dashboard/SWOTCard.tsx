'use client';

import type { SWOTAnalysis } from '@/types/recommendation';

interface SWOTCardProps {
  swot?: SWOTAnalysis;
}

const SWOT_CONFIG = [
  {
    key: 'strengths' as const,
    label: 'Strengths',
    emoji: '💪',
    color: 'var(--success)',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    key: 'weaknesses' as const,
    label: 'Weaknesses',
    emoji: '⚠️',
    color: 'var(--warning)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    key: 'opportunities' as const,
    label: 'Opportunities',
    emoji: '🚀',
    color: 'var(--brand-light)',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
  },
  {
    key: 'threats' as const,
    label: 'Threats',
    emoji: '🛡️',
    color: 'var(--danger)',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
];

export default function SWOTCard({ swot }: SWOTCardProps) {
  if (!swot) {
    return (
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>SWOT Analysis</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>SWOT analysis unavailable.</p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>SWOT Analysis</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {SWOT_CONFIG.map(({ key, label, emoji, color, bg, border }) => (
          <div
            key={key}
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: bg,
              border: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              <span style={{ fontSize: '16px' }}>{emoji}</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color }}>{label}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {swot[key].map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    paddingLeft: '12px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: color,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
