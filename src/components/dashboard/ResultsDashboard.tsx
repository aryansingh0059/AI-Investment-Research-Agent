'use client';

import type { GraphState } from '@/lib/langgraph/state';
import CompanyCard from './CompanyCard';
import InvestmentCard from './InvestmentCard';
import FinancialCard from './FinancialCard';
import NewsCard from './NewsCard';
import CompetitorCard from './CompetitorCard';
import SWOTCard from './SWOTCard';
import RiskCard from './RiskCard';
import GrowthCard from './GrowthCard';
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
        padding: '32px 0 64px',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}
          >
            Investment Report:{' '}
            <span className="gradient-text">{result.companyProfile?.name ?? company}</span>
          </h1>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}
          >
            <Clock size={13} />
            Analysis completed in {formatElapsed(elapsedMs)}
            {result.errors.length > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--warning)' }}>
                · {result.errors.length} data warning(s)
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportToMarkdown(result)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '10px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            <Download size={14} /> Export MD
          </button>
          <button
            onClick={() => exportToPDF()}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '10px',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500, fontFamily: 'var(--font-sans)',
              transition: 'all 0.15s',
            }}
          >
            <Download size={14} /> Export PDF
          </button>
          <button
            onClick={onReset}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 18px', borderRadius: '10px',
              background: 'var(--gradient-brand)', border: 'none',
              color: 'white', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }}
          >
            <RefreshCw size={14} /> New Analysis
          </button>
        </div>
      </div>

      {/* Content */}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <InvestmentCard result={result} />
          <CompanyCard profile={result.companyProfile} />
        </div>

        {/* Row 2: Financial metrics */}
        <FinancialCard financialData={result.financialData} />

        {/* Row 3: News + Competitors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <NewsCard news={result.news} sentiment={result.newsSentiment} />
          <CompetitorCard competitors={result.competitors} currentSymbol={result.symbol} />
        </div>

        {/* Row 4: SWOT + Growth */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
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
