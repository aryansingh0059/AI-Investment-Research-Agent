'use client';

import { useState, useRef } from 'react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
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
      className="hero-flat-bg"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        minHeight: 'calc(100vh - 56px)',
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
        {/* Sparkles / Info Badge */}
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
          Enterprise Intelligence Terminal
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '38px',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '16px',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
          }}
        >
          AI Investment Research Agent
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            marginBottom: '36px',
            lineHeight: 1.6,
            maxWidth: '520px',
            margin: '0 auto 36px',
          }}
        >
          Conduct comprehensive equity research in seconds. Our engine runs an isolated 
          LangGraph workflow analyzing financials, market metrics, sentiment, and risks 
          to generate institutional-grade reports.
        </p>

        {/* Search Console */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              borderRadius: '8px',
              border: `1px solid ${focused ? 'var(--border-active)' : 'var(--border)'}`,
              background: 'var(--bg-card)',
              transition: 'border-color 0.15s ease',
              overflow: 'hidden',
              padding: '4px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              <Search size={16} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search company or ticker symbol..."
              id="company-search-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                padding: '12px 16px 12px 42px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="submit"
              disabled={!value.trim()}
              className="btn-primary"
              style={{
                padding: '0 16px',
                height: '38px',
                borderRadius: '6px',
                gap: '6px',
              }}
            >
              Search
              <ArrowRight size={14} />
            </button>
          </div>
        </form>

        {/* Examples */}
        <div style={{ marginBottom: '48px' }}>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              marginBottom: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            Select Asset Symbol
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              justifyContent: 'center',
            }}
          >
            {EXAMPLE_COMPANIES.map((c) => (
              <button
                key={c.symbol}
                onClick={() => handleChip(c.name)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '4px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = 'var(--border-hover)';
                  target.style.color = 'var(--text-primary)';
                  target.style.backgroundColor = 'var(--bg-card-hover)';
                }}
                onMouseLeave={(e) => {
                  const target = e.currentTarget;
                  target.style.borderColor = 'var(--border)';
                  target.style.color = 'var(--text-secondary)';
                  target.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                {c.symbol} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metadata stats strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Market Indexes', value: 'Global' },
            { label: 'Data Source', value: 'Yahoo Finance' },
            { label: 'Model Core', value: 'Gemini 2.5' },
            { label: 'Analytic Steps', value: '9 Nodes' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'left', minWidth: '100px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
