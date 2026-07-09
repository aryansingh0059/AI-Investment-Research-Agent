'use client';

import type { GraphState } from '@/lib/langgraph/state';
import CompanyCard from './CompanyCard';
import InvestmentCard from './InvestmentCard';
import FinancialCard from './FinancialCard';
import NewsCard from './NewsCard';
import CompetitorCard from './CompetitorCard';
import SWOTCard from './SWOTCard';
import GrowthCard from './GrowthCard';
import RiskCard from './RiskCard';
import ReasoningCard from './ReasoningCard';
import { RefreshCw, Download, Clock } from 'lucide-react';
import { exportToPDF, exportToMarkdown } from '@/lib/utils/export';

interface ResultsDashboardProps {
  result: GraphState;
  company: string;
  elapsedMs: number;
  onReset: () => void;
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function ResultsDashboard({
  result,
  company,
  elapsedMs,
  onReset,
}: ResultsDashboardProps) {
  return (
    <main
      id="results-dashboard"
      style={{
        flex: 1,
        background: 'var(--bg-base)',
        padding: '24px 0 48px',
      }}
    >
      {/* Top dashboard control panel */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '4px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Equity Research Report: {result.companyProfile?.name ?? company}
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Clock size={12} />
            RUN TIME: {formatElapsed(elapsedMs)}
            {result.errors.length > 0 && (
              <span style={{ color: 'var(--warning)' }}>
                · WARNINGS: {result.errors.length}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportToMarkdown(result)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', gap: '6px' }}
          >
            <Download size={12} /> Export Markdown
          </button>
          <button
            onClick={() => exportToPDF()}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', gap: '6px' }}
          >
            <Download size={12} /> Export PDF
          </button>
          <button
            onClick={onReset}
            className="btn-primary"
            style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '4px', gap: '6px' }}
          >
            <RefreshCw size={12} /> New Analysis
          </button>
        </div>
      </div>

      {/* Grid Layout (Desktop First, Tablet, Mobile) */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Row 1: Investment recommendation (hero) + Company Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <InvestmentCard result={result} />
          <CompanyCard profile={result.companyProfile} />
        </div>

        {/* Row 2: Financial metrics */}
        <FinancialCard financialData={result.financialData} />

        {/* Row 3: News + Competitors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <NewsCard news={result.news} sentiment={result.newsSentiment} />
          <CompetitorCard competitors={result.competitors} currentSymbol={result.symbol} />
        </div>

        {/* Row 4: SWOT + Growth */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          <SWOTCard swot={result.swot} />
          <GrowthCard growthFactors={result.growthFactors} />
        </div>

        {/* Row 5: Risk */}
        <RiskCard risks={result.risks} />

        {/* Row 6: AI Reasoning */}
        <ReasoningCard
          reasoning={result.reasoning}
          summary={result.summary}
          scores={result.scores}
          errors={result.errors}
        />
      </div>
    </main>
  );
}
