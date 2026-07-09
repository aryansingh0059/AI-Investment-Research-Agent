'use client';

import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import type { AnalysisStep } from '@/types/recommendation';

const LOADING_PIPELINE = [
  { step: 'company_research', label: 'Identifying Company' },
  { step: 'financial_analysis', label: 'Fetching Financial Statements' },
  { step: 'news_analysis', label: 'Reading News' },
  { step: 'web_search', label: 'Market Intelligence' },
  { step: 'competitor_analysis', label: 'Competitor Analysis' },
  { step: 'risk_analysis', label: 'Risk Assessment' },
  { step: 'decision_engine', label: 'AI Decision Engine' },
];

interface LoadingScreenProps {
  status: AnalysisStep;
  message: string;
  steps: { step: AnalysisStep; message: string; timestamp: number }[];
  elapsedMs: number;
  company: string;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function LoadingScreen({
  status,
  message,
  steps,
  elapsedMs,
  company,
}: LoadingScreenProps) {
  const completedSteps = new Set(steps.map((s) => s.step));

  // Determine current active index in the pipeline mapping
  let activeIdx = 0;
  if (status === 'financial_analysis') activeIdx = 1;
  else if (status === 'news_analysis') activeIdx = 2;
  else if (status === 'web_search') activeIdx = 3;
  else if (status === 'competitor_analysis') activeIdx = 4;
  else if (status === 'risk_analysis' || status === 'growth_analysis' || status === 'swot_generation') activeIdx = 5;
  else if (status === 'decision_engine') activeIdx = 6;

  const progress = ((activeIdx + 1) / LOADING_PIPELINE.length) * 100;

  return (
    <main
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        minHeight: 'calc(100vh - 56px)',
        background: 'var(--bg-base)',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
        }}
        className="animate-fade-in"
      >
        {/* Sleek Terminal Header */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <Loader2
            size={18}
            color="var(--brand-light)"
            style={{ animation: 'spin 1.5s linear infinite' }}
          />
        </div>

        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '4px',
            letterSpacing: '-0.02em',
          }}
        >
          Analyzing <span style={{ color: 'var(--brand-light)' }}>{company}</span>
        </h2>
        
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            fontSize: '12px',
          }}
        >
          {message}
        </p>

        {/* Pipeline List */}
        <div
          className="card"
          style={{ textAlign: 'left', padding: '14px 18px', marginBottom: '20px' }}
        >
          {LOADING_PIPELINE.map((p, idx) => {
            const isCurrent = activeIdx === idx;
            const isDone = activeIdx > idx || (idx === 0 && completedSteps.has('company_research') && activeIdx !== 0);
            const isPending = activeIdx < idx;

            return (
              <div
                key={p.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                  borderBottom: idx < LOADING_PIPELINE.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: isPending ? 0.35 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Status Indicator */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {isDone ? (
                    <span style={{ color: 'var(--success)', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                  ) : isCurrent ? (
                    <Loader2
                      size={13}
                      color="var(--brand-light)"
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                  ) : (
                    <Circle size={13} color="var(--border)" />
                  )}
                </div>

                {/* Label */}
                <div style={{ flex: 1, fontSize: '13px' }}>
                  <span
                    style={{
                      color: isCurrent
                        ? 'var(--text-primary)'
                        : isDone
                        ? 'var(--text-secondary)'
                        : 'var(--text-muted)',
                      fontWeight: isCurrent ? 500 : 400,
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Flat Progress Bar */}
        <div className="progress-container" style={{ marginBottom: '8px' }}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>GENERATING REPORT...</span>
          <span>{formatElapsed(elapsedMs)}</span>
        </div>
      </div>
    </main>
  );
}
