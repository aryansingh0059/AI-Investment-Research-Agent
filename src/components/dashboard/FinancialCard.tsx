'use client';

import type { FinancialData } from '@/types/financial';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils/formatters';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from 'recharts';

interface FinancialCardProps {
  financialData?: FinancialData;
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '12px',
  },
};

function MetricBox({
  label,
  value,
  sub,
  color = 'var(--text-primary)',
}: {
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: '14px',
        borderRadius: '12px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

export default function FinancialCard({ financialData }: FinancialCardProps) {
  if (!financialData) {
    return (
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Financial Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Financial data unavailable. Yahoo Finance could not return statements for this symbol.</p>
      </div>
    );
  }

  const { incomeStatements, cashFlows, metrics } = financialData;

  // Prepare chart data (most recent first → reverse for chronological)
  const revenueData = [...incomeStatements].reverse().map((s) => ({
    year: s.date.split('-')[0],
    Revenue: s.revenue / 1e9,
    'Net Income': s.netIncome / 1e9,
  }));

  const cashFlowData = [...cashFlows].reverse().map((c) => ({
    year: c.date.split('-')[0],
    'Free Cash Flow': c.freeCashFlow / 1e9,
    'Operating CF': c.operatingCashFlow / 1e9,
  }));

  const m = metrics;

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Financial Analysis</h2>

      {/* Key Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}
      >
        <MetricBox
          label="Revenue"
          value={formatCurrency(financialData.latestRevenue)}
          color="var(--brand-light)"
        />
        <MetricBox
          label="Net Income"
          value={formatCurrency(financialData.latestNetIncome)}
          color={
            (financialData.latestNetIncome ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)'
          }
        />
        <MetricBox
          label="EPS"
          value={financialData.latestEPS != null ? `$${financialData.latestEPS.toFixed(2)}` : 'N/A'}
        />
        <MetricBox
          label="Free Cash Flow"
          value={formatCurrency(financialData.latestFreeCashFlow)}
          color={(financialData.latestFreeCashFlow ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
        <MetricBox label="Total Debt" value={formatCurrency(financialData.totalDebt)} color="var(--warning)" />
        <MetricBox label="Cash" value={formatCurrency(financialData.cash)} color="var(--success)" />
        <MetricBox label="P/E Ratio" value={m.peRatio != null ? m.peRatio.toFixed(1) : 'N/A'} />
        <MetricBox
          label="Revenue Growth"
          value={formatPercent(m.revenueGrowthYoy)}
          color={(m.revenueGrowthYoy ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
        <MetricBox label="Net Margin" value={formatPercent(m.netMargin)} />
        <MetricBox label="Operating Margin" value={formatPercent(m.operatingMargin)} />
        <MetricBox label="ROE" value={formatPercent(m.roe)} />
        <MetricBox label="ROA" value={formatPercent(m.roa)} />
        <MetricBox label="Debt/Equity" value={m.debtToEquity != null ? m.debtToEquity.toFixed(2) : 'N/A'} />
        <MetricBox label="Current Ratio" value={m.currentRatio != null ? m.currentRatio.toFixed(2) : 'N/A'} />
        <MetricBox label="Dividend Yield" value={formatPercent(m.dividendYield)} />
        <MetricBox label="Beta" value={m.beta != null ? m.beta.toFixed(2) : 'N/A'} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {revenueData.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              Revenue & Net Income ($B)
            </h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                  <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {cashFlowData.length > 0 && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              Cash Flow ($B)
            </h3>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-muted)' }} />
                  <Line type="monotone" dataKey="Free Cash Flow" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Operating CF" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
