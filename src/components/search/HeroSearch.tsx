'use client';

import { useState, useRef } from 'react';
import { Search, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
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
    <main
      className="hero-bg hero-grid"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        minHeight: 'calc(100vh - 64px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating orbs */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '720px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
        className="animate-fade-in-up"
      >
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            borderRadius: '24px',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            marginBottom: '28px',
            fontSize: '13px',
            color: 'var(--brand-light)',
            fontWeight: 500,
          }}
        >
          <Sparkles size={14} />
          Powered by Google Gemini + LangGraph
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
            letterSpacing: '-0.04em',
          }}
        >
          AI-Powered{' '}
          <span className="gradient-text">Investment</span>
          <br />
          Research Agent
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--text-secondary)',
            marginBottom: '48px',
            lineHeight: 1.7,
            maxWidth: '540px',
            margin: '0 auto 48px',
          }}
        >
          Enter any company name. Our AI analyst performs comprehensive equity research
          — financial analysis, news sentiment, SWOT, risk scoring — and delivers a
          professional investment recommendation in seconds.
        </p>

        {/* Search form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              borderRadius: '16px',
              border: `1px solid ${focused ? 'var(--border-active)' : 'var(--border)'}`,
              background: 'var(--bg-card)',
              boxShadow: focused ? 'var(--shadow-brand)' : 'var(--shadow-md)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: focused ? 'var(--brand)' : 'var(--text-muted)',
                transition: 'color 0.2s',
                pointerEvents: 'none',
              }}
            >
              <Search size={20} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Enter company name (e.g. Apple, Tesla, Reliance...)"
              id="company-search-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '18px 20px 18px 52px',
                fontSize: '17px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!value.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                margin: '8px',
                borderRadius: '10px',
                background: value.trim() ? 'var(--gradient-brand)' : 'var(--border)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                cursor: value.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Analyze
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Example chips */}
        <div>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginBottom: '12px',
            }}
          >
            Try an example:
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            {EXAMPLE_COMPANIES.map((c) => (
              <button
                key={c.symbol}
                onClick={() => handleChip(c.name)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--border-hover)';
                  (e.target as HTMLButtonElement).style.color = 'var(--text-primary)';
                  (e.target as HTMLButtonElement).style.background = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = 'var(--border)';
                  (e.target as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  (e.target as HTMLButtonElement).style.background = 'var(--bg-card)';
                }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginTop: '64px',
            paddingTop: '32px',
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Data Sources', value: '5+' },
            { label: 'AI Models', value: 'Gemini' },
            { label: 'Analysis Nodes', value: '9' },
            { label: 'Avg. Time', value: '~30s' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  background: 'var(--gradient-brand)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
