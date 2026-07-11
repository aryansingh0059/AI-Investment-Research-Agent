'use client';

import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';

interface CompanyNotFoundProps {
  searchedQuery: string;
  message?: string;
  onAnalyze: (company: string) => void;
  onReset: () => void;
}

const SUGGESTIONS = ['Apple', 'Microsoft', 'Amazon', 'Tesla', 'Reliance', 'Infosys'];

export default function CompanyNotFound({
  searchedQuery,
  message,
  onAnalyze,
  onReset,
}: CompanyNotFoundProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '16px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            marginBottom: '24px',
          }}
        >
          <Search size={32} color="var(--brand-light)" strokeWidth={1.5} />
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          style={{
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            marginBottom: '12px',
            color: 'var(--text-primary)',
          }}
        >
          Company Not Found
        </motion.h2>

        {/* Searched query badge */}
        {searchedQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ marginBottom: '12px' }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '3px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                background: 'rgba(239,68,68,0.08)',
                color: 'var(--danger)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              &ldquo;{searchedQuery}&rdquo;
            </span>
          </motion.div>
        )}

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            marginBottom: '32px',
          }}
        >
          {message && message !== `No publicly listed company was found matching "${searchedQuery}". Please verify the spelling or try a valid ticker symbol.`
            ? message
            : "We couldn't find a publicly listed company matching your search. Please verify the spelling or search using a valid company name or stock ticker."}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Suggested examples
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </motion.div>

        {/* Suggestion chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => onAnalyze(suggestion)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--brand-light)';
                e.currentTarget.style.color = 'var(--brand-light)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.background = 'var(--bg-surface)';
              }}
            >
              {suggestion}
            </button>
          ))}
        </motion.div>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35 }}
        >
          <button
            onClick={onReset}
            className="btn-primary"
            style={{
              padding: '10px 28px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            Try Another Search
            <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
