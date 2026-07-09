'use client';

import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import type { AnalysisStep } from '@/types/recommendation';
import { ANALYSIS_STEP_LABELS } from '@/constants';

const ORDERED_STEPS: AnalysisStep[] = [
  'company_research',
  'financial_analysis',
  'news_analysis',
  'web_search',
  'competitor_analysis',
  'risk_analysis',
  'growth_analysis',
  'swot_generation',
  'decision_engine',
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
  const currentIdx = ORDERED_STEPS.indexOf(status);
  const progress = currentIdx >= 0 ? ((currentIdx + 1) / ORDERED_STEPS.length) * 100 : 5;
  const completedSteps = new Set(steps.map((s) => s.step));

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
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
        }}
        className="animate-fade-in"
      >
        {/* Sleek Terminal Header */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Loader2
            size={20}
            color="var(--brand-light)"
            style={{ animation: 'spin 1.5s linear infinite' }}
          />
        </div>

        <h2
          style={{
            fontSize: '22px',
            fontWeight: 600,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Analyzing <span style={{ color: 'var(--brand-light)' }}>{company}</span>
        </h2>
        
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            fontSize: '13px',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

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
            marginBottom: '24px',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span>{Math.round(progress)}% COMPLETE</span>
          <span>ELAPSED: {formatElapsed(elapsedMs)}</span>
        </div>

        {/* Steps Card */}
        <div
          className="card"
          style={{ textAlign: 'left', padding: '16px 20px' }}
        >
          {ORDERED_STEPS.map((step, idx) => {
            const isDone = completedSteps.has(step) && step !== status;
            const isCurrent = step === status;
            const isPending = !completedSteps.has(step) && !isCurrent;

            return (
              <div
                key={step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                  borderBottom: idx < ORDERED_STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: isPending ? 0.35 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {/* Status Indicator */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                  {isDone ? (
                    <CheckCircle size={14} color="var(--success)" />
                  ) : isCurrent ? (
                    <Loader2
                      size={14}
                      color="var(--brand-light)"
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                  ) : (
                    <Circle size={14} color="var(--border)" />
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
                    {ANALYSIS_STEP_LABELS[step]}
                  </span>
                </div>

                {/* Index Indicator */}
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  0{idx + 1}
                </div>
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: '16px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          LangGraph Pipeline Executing in Isolated Environment
        </p>
      </div>
    </main>
  );
}
