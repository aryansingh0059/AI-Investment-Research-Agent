'use client';

import type { SWOTAnalysis } from '@/types/recommendation';

interface SWOTCardProps {
  swot?: SWOTAnalysis;
}

const SWOT_CONFIG = [
  {
    key: 'strengths' as const,
    label: 'Strengths',
    color: 'var(--success)',
    bg: 'rgba(16,185,129,0.04)',
    border: 'rgba(16,185,129,0.15)',
  },
  {
    key: 'weaknesses' as const,
    label: 'Weaknesses',
    color: 'var(--warning)',
    bg: 'rgba(245,158,11,0.04)',
    border: 'rgba(245,158,11,0.15)',
  },
  {
    key: 'opportunities' as const,
    label: 'Opportunities',
    color: 'var(--brand-light)',
    bg: 'rgba(59,130,246,0.04)',
    border: 'rgba(59,130,246,0.15)',
  },
  {
    key: 'threats' as const,
    label: 'Threats',
    color: 'var(--danger)',
    bg: 'rgba(239,68,68,0.04)',
    border: 'rgba(239,68,68,0.15)',
  },
];

export default function SWOTCard({ swot }: SWOTCardProps) {
  if (!swot) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>SWOT Analysis</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>SWOT analysis unavailable.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>SWOT Analysis</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {SWOT_CONFIG.map(({ key, label, color, bg, border }) => (
          <div
            key={key}
            style={{
              padding: '12px 14px',
              borderRadius: '6px',
              background: bg,
              border: `1px solid ${border}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
              }}
            >
              <div style={{ width: '3px', height: '10px', background: color, borderRadius: '1px' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {swot[key].map((item, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                    paddingLeft: '10px',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '5px',
                      width: '3px',
                      height: '3px',
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
