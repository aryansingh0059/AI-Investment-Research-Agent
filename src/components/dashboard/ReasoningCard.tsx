'use client';

import type { Scores } from '@/types/recommendation';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ReasoningCardProps {
  reasoning?: string;
  summary?: string;
  scores?: Scores;
  errors: string[];
}

export default function ReasoningCard({ reasoning, summary, scores, errors }: ReasoningCardProps) {
  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
        🧠 AI Analyst Reasoning
      </h2>

      {/* Executive Summary */}
      {summary && (
        <div
          style={{
            padding: '16px',
            borderRadius: '12px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.2)',
            marginBottom: '20px',
            display: 'flex',
            gap: '12px',
          }}
        >
          <Info size={16} style={{ color: 'var(--brand)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brand-light)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Executive Summary
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {summary}
            </p>
          </div>
        </div>
      )}

      {/* Detailed reasoning */}
      {reasoning ? (
        <div
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: '1.8',
            whiteSpace: 'pre-wrap',
            padding: '16px',
            borderRadius: '12px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            marginBottom: errors.length > 0 ? '16px' : 0,
          }}
        >
          {reasoning}
        </div>
      ) : (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          AI reasoning unavailable. Add GEMINI_API_KEY for detailed analysis.
        </p>
      )}

      {/* Confidence indicator */}
      {scores && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
          }}
        >
          <CheckCircle size={14} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Analysis confidence:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{scores.confidence}%</strong>
            {scores.confidence < 60 && (
              <span style={{ color: 'var(--warning)', marginLeft: '8px' }}>
                (limited data available — add missing API keys for higher confidence)
              </span>
            )}
          </span>
        </div>
      )}

      {/* Errors/warnings */}
      {errors.length > 0 && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <AlertTriangle size={14} style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--warning)' }}>
              Data Warnings ({errors.length})
            </span>
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {errors.map((err, i) => (
              <li key={i} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p
        style={{
          marginTop: '16px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          borderTop: '1px solid var(--border)',
          paddingTop: '12px',
        }}
      >
        ⚠️ This is AI-generated analysis for research purposes only. It is NOT financial advice.
        Always conduct your own due diligence and consult a qualified financial advisor before investing.
      </p>
    </div>
  );
}
