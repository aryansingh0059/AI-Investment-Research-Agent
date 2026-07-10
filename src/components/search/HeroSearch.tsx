'use client';

import { useState, useRef } from 'react';
import {
  Search, Sparkles, ArrowRight, BarChart2, Brain,
  MessageSquare, ShieldAlert, CheckSquare, Users, LayoutDashboard,
  Database, Cpu, Network, FileText, SearchCode, Code2, Globe2
} from 'lucide-react';
import { EXAMPLE_COMPANIES } from '@/constants';

interface HeroSearchProps {
  onAnalyze: (company: string) => void;
}

export default function HeroSearch({ onAnalyze }: HeroSearchProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onAnalyze(value.trim());
  };

  const handleChip = (name: string) => {
    setValue(name);
    onAnalyze(name);
  };

  return (
    <div style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── SECTION 2: HERO ── */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px 64px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(80vh - 56px)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '4px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            marginBottom: '24px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
        >
          <Sparkles size={12} style={{ color: 'var(--brand-light)' }} />
          Institutional Investment Analytics Engine
        </div>

        <img
          src="/logo2.png"
          alt="EquityLens Logo"
          style={{
            height: '48px',
            width: 'auto',
            marginBottom: '20px',
          }}
        />

        <h1
          style={{
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: '20px',
            letterSpacing: '-0.03em',
          }}
        >
          EquityLens
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-secondary)',
            marginBottom: '40px',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '0 auto 40px',
          }}
        >
          Research publicly listed companies using AI-powered financial analysis, market intelligence, latest news, and investment reasoning.
        </p>

        {/* Large Search Console */}
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '640px', marginBottom: '48px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              borderRadius: '8px',
              border: `1px solid ${focused ? 'var(--border-active)' : 'var(--border)'}`,
              background: 'var(--bg-card)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
              boxShadow: focused ? '0 0 0 2px rgba(59, 130, 246, 0.15)' : 'none',
              padding: '6px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              <Search size={18} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search Apple, Tesla, Microsoft..."
              id="company-search-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '14px 16px 14px 44px',
                fontSize: '15px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  setValue('');
                  inputRef.current?.focus();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  outline: 'none',
                }}
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              disabled={!value.trim()}
              className="btn-primary"
              style={{
                padding: '0 20px',
                borderRadius: '4px',
                gap: '8px',
              }}
            >
              Analyze Company
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </section>

      {/* ── SECTION 6: EXAMPLE COMPANIES (Moved Immediately Below Hero) ── */}
      <section
        id="about"
        style={{
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '64px 24px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Select Preset Company Symbol</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Click any company card below to run a standard research agent run immediately.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {EXAMPLE_COMPANIES.map((c) => (
              <button
                key={c.symbol}
                onClick={() => handleChip(c.name)}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = 'var(--border-hover)';
                  target.style.backgroundColor = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = 'var(--border)';
                  target.style.backgroundColor = 'var(--bg-card)';
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                  {c.symbol}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {c.name}
                </div>
                <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--brand-light)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Run Agent <ArrowRight size={10} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: KEY FEATURES ── */}
      <section
        id="features"
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '80px 24px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Institutional Grade Capabilities</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Full fundamental and qualitative research suite consolidated in a single view.</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {[
            {
              icon: <BarChart2 size={18} />,
              title: 'Financial Analysis',
              desc: 'Pulls dynamic balance sheet, income, and cash flow historical models mapped to clean standardized metrics.',
            },
            {
              icon: <Brain size={18} />,
              title: 'AI Research',
              desc: 'Runs structured LLM reasoning nodes over data context to deliver detailed narrative writeups and evaluations.',
            },
            {
              icon: <MessageSquare size={18} />,
              title: 'News Intelligence',
              desc: 'Collects live press headlines and applies a structured lexicon scorer to index current market sentiment.',
            },
            {
              icon: <ShieldAlert size={18} />,
              title: 'Risk Assessment',
              desc: 'Categorizes systematic risks including macroeconomic, regulatory, geographical, and technological exposures.',
            },
            {
              icon: <CheckSquare size={18} />,
              title: 'Investment Recommendation',
              desc: 'Synthesizes analytical outputs to calculate final scores and clear actions (INVEST, WATCH, or PASS).',
            },
            {
              icon: <Users size={18} />,
              title: 'Competitor Analysis',
              desc: 'Maps relative market capitalization, share pricing, and valuation ratios against industry peers.',
            },
            {
              icon: <LayoutDashboard size={18} />,
              title: 'Interactive Dashboard',
              desc: 'Renders comprehensive data visual charts, tables, summaries, and quick export actions.',
            },
          ].map((feat) => (
            <div
              key={feat.title}
              className="card"
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '20px',
              }}
            >
              <div
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--brand-light)',
                  flexShrink: 0,
                }}
              >
                {feat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {feat.title}
                </h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 5: HOW IT WORKS ── */}
      <section
        id="how-it-works"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '80px 24px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Pipeline Topology</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>How the underlying LangGraph agent structures the research workflow.</p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxWidth: '640px',
              margin: '0 auto',
            }}
          >
            {[
              { num: '01', title: 'Search Company', desc: 'Accepts query input and resolves standard ticker notation using symbol directories.' },
              { num: '02', title: 'Collect Financial Data', desc: 'Queries fundamental income, balance sheet, and cash flow statement arrays for the last 4 fiscal years.' },
              { num: '03', title: 'Analyze Market News', desc: 'Gathers live news releases, scores individual sentiments, and calculates overall ratios.' },
              { num: '04', title: 'AI Research', desc: 'Processes parallel evaluation nodes assessing growth prospects, systematic risk, and SWOT matrices.' },
              { num: '05', title: 'Investment Recommendation', desc: 'Synthesizes metrics, confidence scores, and outputs a clear action plan.' },
              { num: '06', title: 'Interactive Dashboard', desc: 'Renders the report instantly with full layout charting and quick markdown export capability.' },
            ].map((step) => (
              <div
                key={step.num}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '16px',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--brand-light)',
                    padding: '2px 6px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                  }}
                >
                  {step.num}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: TRUSTED TECHNOLOGIES (Moved To Bottom) ── */}
      <section
        id="technology"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          padding: '64px 24px',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            INTEGRATED SYSTEM PROVIDERS & PLATFORMS
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {[
              { name: 'Yahoo Finance', icon: <Database size={12} /> },
              { name: 'Gemini', icon: <Cpu size={12} /> },
              { name: 'LangGraph', icon: <Network size={12} /> },
              { name: 'NewsAPI', icon: <FileText size={12} /> },
              { name: 'Tavily', icon: <SearchCode size={12} /> },
              { name: 'Next.js', icon: <Globe2 size={12} /> },
              { name: 'TypeScript', icon: <Code2 size={12} /> },
            ].map((tech) => (
              <div
                key={tech.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                {tech.icon}
                <span>{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
