'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
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

const STEP_ICONS: Record<string, string> = {
  company_research: '🏢',
  financial_analysis: '📊',
  news_analysis: '📰',
  web_search: '🔍',
  competitor_analysis: '⚡',
  risk_analysis: '🛡️',
  growth_analysis: '🚀',
  swot_generation: '🧠',
  decision_engine: '🎯',
};

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
        minHeight: 'calc(100vh - 64px)',
        background: 'var(--bg-base)',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          width: '100%',
          textAlign: 'center',
        }}
        className="animate-fade-in"
      >
        {/* Animated logo */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            fontSize: '36px',
            boxShadow: 'var(--shadow-brand)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        >
          🔬
        </div>

        <h2
          style={{
            fontSize: '28px',
            fontWeight: 800,
            marginBottom: '8px',
          }}
        >
          Analyzing{' '}
          <span className="gradient-text">{company}</span>
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            fontSize: '15px',
          }}
        >
          {message}
        </p>

        {/* Progress bar */}
        <div className="progress-bar" style={{ marginBottom: '8px', borderRadius: '4px' }}>
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '32px',
          }}
        >
          <span>{Math.round(progress)}%</span>
          <span>⏱ {formatElapsed(elapsedMs)}</span>
        </div>

        {/* Steps list */}
        <div
          className="card"
          style={{ textAlign: 'left', padding: '20px' }}
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
                  padding: '10px 0',
                  borderBottom: idx < ORDERED_STEPS.length - 1 ? '1px solid var(--border)' : 'none',
                  opacity: isPending ? 0.4 : 1,
                  transition: 'opacity 0.3s',
                }}
              >
                {/* Icon */}
                <div style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>
                  {STEP_ICONS[step]}
                </div>

                {/* Label */}
                <div style={{ flex: 1, fontSize: '14px' }}>
                  <span style={{ color: isCurrent ? 'var(--brand-light)' : isDone ? 'var(--text-secondary)' : 'var(--text-muted)', fontWeight: isCurrent ? 600 : 400 }}>
                    {ANALYSIS_STEP_LABELS[step]}
                  </span>
                </div>

                {/* Status icon */}
                <div>
                  {isDone && <CheckCircle size={16} color="var(--success)" />}
                  {isCurrent && (
                    <Loader2
                      size={16}
                      color="var(--brand)"
                      style={{ animation: 'spin 1s linear infinite' }}
                    />
                  )}
                  {isPending && <Circle size={16} color="var(--border)" />}
                </div>
              </div>
            );
          })}
        </div>

        <p
          style={{
            marginTop: '20px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          Running 9-node LangGraph AI pipeline · Please wait
        </p>
      </div>
    </main>
  );
}
