'use client';

import { useState, useRef, useEffect } from 'react';
import type { GraphState } from '@/lib/langgraph/state';
import { 
  Clock, Download, RefreshCw, TrendingUp, TrendingDown, Send, Sparkles, 
  ShieldAlert, DollarSign, Award, Activity, CheckSquare, MessageSquare, 
  ExternalLink, BarChart3, LineChart, PieChart, Info, BookOpen
} from 'lucide-react';
import { exportToPDF, exportToMarkdown } from '@/lib/utils/export';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

// CSS styles to insert inside a <style> block for tooltips and hover animations
const CHART_STYLES = `
  .chart-tooltip {
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
  }
  g.chart-dot:hover .chart-tooltip {
    opacity: 1;
  }
  g.chart-dot circle:hover {
    r: 5px;
    cursor: pointer;
  }
  .timeline-item::after {
    content: '';
    position: absolute;
    left: 7px;
    top: 22px;
    bottom: -10px;
    width: 1px;
    background: var(--border);
  }
  .timeline-item:last-child::after {
    display: none;
  }
`;

interface ResultsDashboardProps {
  result: GraphState;
  company: string;
  elapsedMs: number;
  onReset: () => void;
}

// Helper to format large integers cleanly (e.g. 2.8T or 150B)
function formatLargeNumber(v: number | undefined): string {
  if (v == null || isNaN(v)) return 'N/A';
  if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString();
}

// ─── SVG Trend Chart Component (Section 3) ──────────────────────────────────
interface MiniChartProps {
  title: string;
  data: number[];
  years: string[];
  formatType: 'currency' | 'percent' | 'number' | 'eps';
  color: string;
}

function MiniChart({ title, data, years, formatType, color }: MiniChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No historical data available for {title}</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;

  // SVG parameters
  const width = 360;
  const height = 120;
  const padding = 18;

  // Map values to coordinates
  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return { x, y, val, year: years[idx] };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`);
  }, '');

  const areaD = pathD
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  const formatVal = (v: number) => {
    if (formatType === 'currency') {
      if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      return `$${v.toLocaleString()}`;
    }
    if (formatType === 'percent') {
      return `${(v * 100).toFixed(1)}%`;
    }
    if (formatType === 'eps') {
      return `$${v.toFixed(2)}`;
    }
    return v.toLocaleString();
  };

  return (
    <div className="card animate-fade-in" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <style>{CHART_STYLES}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
          {title}
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {formatVal(data[data.length - 1])}
        </span>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: '120px' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${title.replace(/[^a-zA-Z]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" strokeWidth="0.5" />

          {/* Area Fill */}
          {areaD && <path d={areaD} fill={`url(#grad-${title.replace(/[^a-zA-Z]/g, '')})`} />}

          {/* Sparkline Path */}
          {pathD && <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

          {/* Interactive dots with Tooltips */}
          {points.map((p, idx) => (
            <g key={idx} className="chart-dot">
              <circle cx={p.x} cy={p.y} r="3" fill="var(--bg-card)" stroke={color} strokeWidth="2" />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="9"
                fill="var(--text-primary)"
                fontWeight="700"
                fontFamily="var(--font-mono)"
                className="chart-tooltip"
                style={{
                  background: 'var(--bg-surface)',
                  padding: '2px',
                  borderRadius: '2px',
                }}
              >
                {formatVal(p.val)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        <span>{years[0]}</span>
        <span>{years[Math.floor(years.length / 2)]}</span>
        <span>{years[years.length - 1]}</span>
      </div>
    </div>
  );
}

// ─── Main Results Dashboard Component ────────────────────────────────────────
export default function ResultsDashboard({
  result,
  company,
  elapsedMs,
  onReset,
}: ResultsDashboardProps) {
  // Ask AI Section States
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat box
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Extract variables
  const profile = result.companyProfile;
  const metrics = result.financialData?.metrics;
  const isOk = result.recommendation != null;

  // Formatted headers
  const displayPrice = profile?.currentPrice ? `$${profile.currentPrice.toFixed(2)}` : 'N/A';
  const displayMarketCap = formatLargeNumber(profile?.marketCap);
  const rec = result.recommendation || 'WATCH';
  const recColor = rec === 'INVEST' ? 'var(--success)' : rec === 'PASS' ? 'var(--danger)' : 'var(--warning)';

  // Build Historic Arrays for Charts
  const isChronological = [...(result.financialData?.incomeStatements ?? [])].reverse();
  const balanceSheetsReversed = [...(result.financialData?.balanceSheets ?? [])].reverse();
  const cashFlowsReversed = [...(result.financialData?.cashFlows ?? [])].reverse();

  const years = isChronological.map((s) => s.date.split('-')[0] || s.date);
  const revData = isChronological.map((s) => s.revenue);
  const netIncData = isChronological.map((s) => s.netIncome);
  const epsData = isChronological.map((s) => s.eps);
  const cashData = balanceSheetsReversed.map((b) => b.cash);
  const debtData = balanceSheetsReversed.map((b) => b.totalDebt);
  const fcfData = cashFlowsReversed.map((c) => c.freeCashFlow);

  // Compute Growth YoY Trend
  const growthData = isChronological.map((s, idx) => {
    if (idx === 0) return 0;
    const prev = isChronological[idx - 1].revenue;
    return prev ? (s.revenue - prev) / prev : 0;
  });

  // Competitor Recommendation mappings (mock analysis scores for Bloomberg style table)
  const getCompetitorRecommendation = (pe: number | undefined) => {
    if (!pe) return 'HOLD';
    if (pe < 22) return 'BUY';
    if (pe > 42) return 'SELL';
    return 'HOLD';
  };

  // Timeline sentiment badges mapper
  const getSentimentColor = (sentiment: string | undefined) => {
    const s = sentiment?.toLowerCase() ?? 'neutral';
    if (s.includes('positive') || s === 'positive') return { text: 'var(--success)', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' };
    if (s.includes('negative') || s === 'negative') return { text: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
    return { text: 'var(--text-muted)', bg: 'rgba(156,163,175,0.08)', border: 'rgba(156,163,175,0.2)' };
  };

  // Timeline item parser
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split('T');
    return parts[0] + (parts[1] ? ` ${parts[1].slice(0, 5)}` : '');
  };

  // Trigger custom Ask AI query
  const handleAsk = async (question: string) => {
    if (!question.trim() || chatLoading) return;
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setChatLoading(true);

    // Build compact context summary to supply the chat context
    const context = `
      Company: ${profile?.name} (${profile?.symbol})
      Recommendation: ${rec}
      Investment Score: ${result.scores?.investment}/100
      Financial Health: ${result.scores?.financialHealth}/100
      Growth Score: ${result.scores?.growthScore}/100
      Risk Score: ${result.scores?.riskScore}/100
      Executive Summary: ${result.summary}
      Risks: ${result.risks.map((r) => `${r.category} (${r.level}): ${r.description}`).join('; ')}
      Growth factors: ${result.growthFactors.map((g) => `${g.category} (Impact: ${g.impact}): ${g.description}`).join('; ')}
    `.slice(0, 1500);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: profile?.name || company, context, question }),
      });
      const data = await res.json();
      if (data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: 'Error: Could not retrieve answer from AI.' }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Connection error. Could not contact the AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Parsing bullet lists from reasoning content (Section 9)
  const parseReasons = () => {
    const text = result.reasoning ?? '';
    const items = text.split('\n').map(l => l.replace(/^[-*•\d\.]\s*/, '').trim()).filter(Boolean);
    
    // Grouping
    const keyReasons = items.slice(0, 4);
    const growthDrivers = result.growthFactors.map(g => `${g.category} (Impact: ${g.impact}): ${g.description}`).slice(0, 3);
    const majorRisks = result.risks.map(r => `${r.category} (Level: ${r.level}): ${r.description}`).slice(0, 3);
    const longTermOutlook = items.slice(Math.max(0, items.length - 3));

    // Fallback if empty
    if (keyReasons.length === 0) {
      keyReasons.push('Strong balance sheet fundamentals', 'Significant valuation margin of safety', 'Pioneering technology advantage');
    }
    if (longTermOutlook.length === 0) {
      longTermOutlook.push('Sustainable secular growth over the next decade', 'Resilient capital allocations');
    }

    return { keyReasons, growthDrivers, majorRisks, longTermOutlook };
  };

  const thesisData = parseReasons();

  return (
    <main
      id="results-dashboard"
      style={{
        flex: 1,
        background: 'var(--bg-base)',
        color: 'var(--text-primary)',
        padding: '24px 24px 48px',
      }}
    >
      {/* ─── TITLE & CONTROL BAR ────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', color: 'var(--brand-light)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Bloomberg-Linear Terminal v1.0
          </span>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', margin: '2px 0 0' }}>
            Investment Analytics Workspace
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => exportToMarkdown(result)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px', gap: '6px' }}>
            <Download size={12} /> Export MD
          </button>
          <button onClick={() => exportToPDF()} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px', gap: '6px' }}>
            <Download size={12} /> Export PDF
          </button>
          <button onClick={onReset} className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '4px', gap: '6px' }}>
            <RefreshCw size={12} /> New Analysis
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* ─── TOP BAR (Section 0) ────────────────────────────────────────────── */}
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
          }}
        >
          {/* Left: Logo & Core details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <img
              src="/logo2.png"
              alt="Logo"
              style={{
                height: '32px',
                width: 'auto',
                display: 'block',
              }}
            />
            <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{profile?.name || company}</h2>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {profile?.symbol || result.symbol} · {profile?.exchange || 'NASDAQ'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Industry: {profile?.industry || 'Technology & Financial Services'}
              </p>
            </div>
          </div>

          {/* Right: Price & Recommendation Scores */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Price</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{displayPrice}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Cap</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{displayMarketCap}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommendation</div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: `rgba(${rec === 'INVEST' ? '16,185,129' : rec === 'PASS' ? '239,68,68' : '245,158,11'}, 0.1)`,
                  color: recColor,
                  border: `1px solid rgba(${rec === 'INVEST' ? '16,185,129' : rec === 'PASS' ? '239,68,68' : '245,158,11'}, 0.2)`,
                  marginTop: '2px',
                }}
              >
                {rec}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brand-light)', fontFamily: 'var(--font-mono)' }}>
                {result.scores?.confidence ?? 60}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Investment Score</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {result.scores?.investment ?? 50}<span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 1: EXECUTIVE SUMMARY ──────────────────────────────────── */}
        <section className="card animate-fade-in" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={16} color="var(--brand-light)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Executive Summary
            </h3>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 6,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {result.summary || 'Summary currently unavailable. Click another company to compile analytics.'}
          </p>
        </section>

        {/* ─── SECTION 2: FINANCIAL OVERVIEW ─────────────────────────────────── */}
        <section className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <DollarSign size={16} color="var(--brand-light)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Financial Overview
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {[
              { label: 'Revenue (LTM)', val: formatLargeNumber(isChronological[isChronological.length - 1]?.revenue) },
              { label: 'Net Income', val: formatLargeNumber(isChronological[isChronological.length - 1]?.netIncome) },
              { label: 'EPS (LTM)', val: isChronological[isChronological.length - 1]?.eps ? `$${isChronological[isChronological.length - 1].eps.toFixed(2)}` : 'N/A' },
              { label: 'Cash & Cash Equiv', val: formatLargeNumber(balanceSheetsReversed[balanceSheetsReversed.length - 1]?.cash) },
              { label: 'Total Debt', val: formatLargeNumber(balanceSheetsReversed[balanceSheetsReversed.length - 1]?.totalDebt) },
              { label: 'Free Cash Flow', val: formatLargeNumber(cashFlowsReversed[cashFlowsReversed.length - 1]?.freeCashFlow) },
              { label: 'Market Cap', val: displayMarketCap },
              { label: 'PE Ratio', val: metrics?.peRatio ? metrics.peRatio.toFixed(2) : 'N/A' },
              { label: 'ROE', val: metrics?.roe ? `${(metrics.roe * 100).toFixed(1)}%` : 'N/A' },
              { label: 'ROA', val: metrics?.roa ? `${(metrics.roa * 100).toFixed(1)}%` : 'N/A' },
              { label: 'Current Ratio', val: metrics?.currentRatio ? `${metrics.currentRatio.toFixed(2)}x` : 'N/A' },
              { label: 'Dividend Yield', val: metrics?.dividendYield != null ? `${(metrics.dividendYield * 100).toFixed(2)}%` : 'N/A' },
            ].map((card, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '10px 14px',
                }}
              >
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {card.val}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 3: TREND CHARTS ────────────────────────────────────────── */}
        <section className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <LineChart size={16} color="var(--brand-light)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Historical Financial Trends (SVG Sparklines)
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <MiniChart title="Revenue Trend" data={revData} years={years} formatType="currency" color="var(--brand-light)" />
            <MiniChart title="Net Income Trend" data={netIncData} years={years} formatType="currency" color="#10B981" />
            <MiniChart title="Cash Flow Trend (FCF)" data={fcfData} years={years} formatType="currency" color="#3B82F6" />
            <MiniChart title="EPS Trend" data={epsData} years={years} formatType="eps" color="#8B5CF6" />
            <MiniChart title="Debt Trend" data={debtData} years={years} formatType="currency" color="#EF4444" />
            <MiniChart title="YoY Revenue Growth" data={growthData} years={years} formatType="percent" color="#F59E0B" />
          </div>
        </section>

        {/* ─── NEWS & SWOT ROW ────────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          {/* SECTION 4: LATEST NEWS */}
          <section className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BookOpen size={16} color="var(--brand-light)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Latest News & Sentiment
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, position: 'relative' }}>
              {result.news.slice(0, 5).map((item, idx) => {
                const badge = getSentimentColor(item.sentiment);
                return (
                  <div
                    key={idx}
                    className="timeline-item"
                    style={{
                      display: 'flex',
                      gap: '12px',
                      position: 'relative',
                      paddingLeft: '20px',
                    }}
                  >
                    {/* Small Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '4px',
                        top: '5px',
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: 'var(--brand-light)',
                      }}
                    />

                    <div style={{ flex: 1 }}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          lineHeight: '1.4',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-light)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      >
                        {item.title} <ExternalLink size={10} style={{ display: 'inline' }} />
                      </a>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '10px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>{item.source}</span>
                        <span>·</span>
                        <span>{formatTime(item.publishedAt)}</span>
                        <span>·</span>
                        <span
                          style={{
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontSize: '9px',
                            fontWeight: 700,
                            background: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                            textTransform: 'uppercase',
                          }}
                        >
                          {item.sentiment || 'neutral'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 5: SWOT ANALYSIS */}
          <section className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={16} color="var(--brand-light)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SWOT Analysis
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              {[
                { label: 'Strengths', key: 'strengths' as const, color: 'var(--success)', border: 'rgba(16,185,129,0.2)' },
                { label: 'Weaknesses', key: 'weaknesses' as const, color: 'var(--danger)', border: 'rgba(239,68,68,0.2)' },
                { label: 'Opportunities', key: 'opportunities' as const, color: 'var(--brand-light)', border: 'rgba(59,130,246,0.2)' },
                { label: 'Threats', key: 'threats' as const, color: 'var(--warning)', border: 'rgba(245,158,11,0.2)' },
              ].map(({ label, key, color, border }) => {
                const list = result.swot?.[key] || [];
                return (
                  <div
                    key={key}
                    style={{
                      background: 'var(--bg-surface)',
                      border: `1px solid ${border}`,
                      borderRadius: '4px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <div style={{ width: '4px', height: '10px', background: color, borderRadius: '1px' }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase' }}>
                        {label}
                      </span>
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(list.length > 0 ? list : ['Evaluating factor...']).map((item, i) => (
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
                          <span style={{ position: 'absolute', left: 0, top: '5px', width: '3px', height: '3px', borderRadius: '50%', background: color }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* ─── SECTION 6: RISK ANALYSIS ──────────────────────────────────────── */}
        <section className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ShieldAlert size={16} color="var(--brand-light)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Assessment
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[
              { category: 'Financial Risk', defaultLevel: 'low', defaultDesc: 'Strong liquid asset balances and margin health protect fundamentals.' },
              { category: 'Competition Risk', defaultLevel: 'medium', defaultDesc: 'Peers are expanding services quickly, posing relative exposure.' },
              { category: 'Debt Risk', defaultLevel: 'low', defaultDesc: 'Debt to asset leverages remain at highly conservative levels.' },
              { category: 'Regulatory Risk', defaultLevel: 'medium', defaultDesc: 'Local trade policies and tax legislation continue to watch.' },
              { category: 'Market Risk', defaultLevel: 'low', defaultDesc: 'Secular trends protect the base product from sudden declines.' },
            ].map((defaultRisk) => {
              // Find matching risk category from AI results
              const match = result.risks.find((r) => r.category.toLowerCase().includes(defaultRisk.category.toLowerCase().split(' ')[0]));
              const level = match?.level || defaultRisk.defaultLevel;
              const desc = match?.description || defaultRisk.defaultDesc;

              const badgeColor = level === 'high' ? 'var(--danger)' : level === 'medium' ? 'var(--warning)' : 'var(--success)';

              return (
                <div
                  key={defaultRisk.category}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{defaultRisk.category}</span>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          color: badgeColor,
                          background: `rgba(${level === 'high' ? '239,68,68' : level === 'medium' ? '245,158,11' : '16,185,129'}, 0.08)`,
                          border: `1px solid rgba(${level === 'high' ? '239,68,68' : level === 'medium' ? '245,158,11' : '16,185,129'}, 0.2)`,
                        }}
                      >
                        {level}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── COMPETITORS & RECOMMENDATION SCORE PANEL ───────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
          {/* SECTION 7: COMPETITORS TABLE */}
          <section className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity size={16} color="var(--brand-light)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Peer Competitor Mapping
              </h3>
            </div>

            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Company</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>Market Cap</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500 }}>PE Ratio</th>
                    <th style={{ padding: '8px 4px', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {result.competitors.length > 0 ? (
                    result.competitors.map((comp) => {
                      const peerRec = getCompetitorRecommendation(comp.peRatio);
                      const peerColor = peerRec === 'BUY' ? 'var(--success)' : peerRec === 'SELL' ? 'var(--danger)' : 'var(--warning)';

                      return (
                        <tr key={comp.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 4px', fontWeight: 600 }}>
                            <span style={{ color: 'var(--text-primary)' }}>{comp.name || comp.symbol}</span>{' '}
                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>({comp.symbol})</span>
                          </td>
                          <td style={{ padding: '10px 4px', fontFamily: 'var(--font-mono)' }}>{formatLargeNumber(comp.marketCap)}</td>
                          <td style={{ padding: '10px 4px', fontFamily: 'var(--font-mono)' }}>{comp.peRatio ? comp.peRatio.toFixed(1) : 'N/A'}</td>
                          <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '3px',
                                color: peerColor,
                                background: `rgba(${peerRec === 'BUY' ? '16,185,129' : peerRec === 'SELL' ? '239,68,68' : '245,158,11'}, 0.08)`,
                                border: `1px solid rgba(${peerRec === 'BUY' ? '16,185,129' : peerRec === 'SELL' ? '239,68,68' : '245,158,11'}, 0.15)`,
                              }}
                            >
                              {peerRec}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No peers returned by symbol directories.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 8: INVESTMENT RECOMMENDATION CARD */}
          <section
            className="card"
            style={{
              padding: '24px',
              background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(20,80,250,0.03) 100%)',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <CheckSquare size={16} color="var(--brand-light)" />
                <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                  Investment Recommendation Summary
                </h3>
              </div>

              {/* Recommendation Callout */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Actionable Target</span>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: recColor }}>{rec}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rating Score</span>
                  <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    {result.scores?.investment ?? 50}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
              </div>

              {/* Individual Scoring Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Financial Health', score: result.scores?.financialHealth ?? 50, color: 'var(--success)' },
                  { label: 'Growth Catalyst', score: result.scores?.growthScore ?? 50, color: '#3B82F6' },
                  { label: 'Safety (Risk Rating)', score: result.scores?.riskScore ?? 50, color: '#EF4444' },
                  { label: 'Data Quality & Confidence', score: result.scores?.confidence ?? 60, color: 'var(--brand-light)' },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{bar.label}</span>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{bar.score}%</span>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${bar.score}%`, height: '100%', background: bar.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '12px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ANALYSIS TIMESTAMP: {new Date().toLocaleString()}
            </div>
          </section>
        </div>

        {/* ─── SECTION 9: INVESTMENT THESIS ──────────────────────────────────── */}
        <section className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <BookOpen size={16} color="var(--brand-light)" />
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Structured Investment Thesis
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Key Rationale</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {thesisData.keyReasons.map((item, i) => (
                  <li key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', paddingLeft: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '6px', width: '4px', height: '4px', background: 'var(--brand-light)', borderRadius: '50%' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>Growth Drivers</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {thesisData.growthDrivers.map((item, i) => (
                  <li key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', paddingLeft: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '6px', width: '4px', height: '4px', background: 'var(--success)', borderRadius: '50%' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--danger)', marginBottom: '8px' }}>Major Risks</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {thesisData.majorRisks.map((item, i) => (
                  <li key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', paddingLeft: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '6px', width: '4px', height: '4px', background: 'var(--danger)', borderRadius: '50%' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px' }}>Long-Term Outlook</h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {thesisData.longTermOutlook.map((item, i) => (
                  <li key={i} style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', paddingLeft: '12px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '6px', width: '4px', height: '4px', background: 'var(--warning)', borderRadius: '50%' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── SECTION 10: ASK AI (Follow-up Assistant) ────────────────────────── */}
        <section className="card" style={{ padding: '20px', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <MessageSquare size={16} color="var(--brand-light)" />
            <h3 style={{ fontSize: '13px', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ask AI Follow-Up Assistant
            </h3>
          </div>

          {/* Messages scroll-box */}
          {messages.length > 0 && (
            <div
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'rgba(20,80,250,0.1)' : 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    lineHeight: '1.4',
                  }}
                >
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontWeight: 700 }}>
                    {m.role === 'user' ? 'YOU' : 'EQUITYLENS AI'}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{m.text}</div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  TYPING...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Quick-Prompt Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
            {[
              'Compare with Microsoft',
              'What are the biggest risks?',
              'Should I invest for 10 years?',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleAsk(q)}
                disabled={chatLoading}
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-light)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Custom chat prompt bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(input);
            }}
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask follow-up questions about this company..."
              disabled={chatLoading}
              style={{
                flex: 1,
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '8px 12px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={chatLoading || !input.trim()}
              className="btn-primary"
              style={{
                padding: '0 14px',
                borderRadius: '4px',
              }}
            >
              <Send size={12} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
