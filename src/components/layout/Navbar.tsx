'use client';

import Link from 'next/link';
import { TrendingUp, BarChart2 } from 'lucide-react';

interface NavbarProps {
  onLogoClick?: () => void;
}

export default function Navbar({ onLogoClick }: NavbarProps) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5, 11, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <button
          onClick={onLogoClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUp size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' }}>
            AI<span className="gradient-text">Research</span>
          </span>
        </button>

        {/* Nav items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--success)',
                animation: 'pulse-glow 2s infinite',
              }}
            />
            <span style={{ fontSize: '12px', color: 'var(--brand-light)', fontWeight: 500 }}>
              AI Analyst Active
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
