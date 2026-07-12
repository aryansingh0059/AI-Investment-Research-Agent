'use client';

import { TrendingUp } from 'lucide-react';


interface NavbarProps {
  onLogoClick?: () => void;
  status?: string;
}

export default function Navbar({ onLogoClick, status = 'idle' }: NavbarProps) {
  const handleScrollToSearch = () => {
    const el = document.getElementById('company-search-input');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isLanding = status === 'idle';

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'var(--bg-base)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '56px',
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
            gap: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
          }}
        >
          <img
            src="/logo2.png"
            alt="EquityLens"
            style={{
              height: '24px',
              width: 'auto',
              display: 'block',
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Equity<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Lens</span>
          </span>
        </button>

        {/* Center Links (Only on Landing Page) */}
        {isLanding && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
            className="hidden md:flex"
          >
            {[
              { label: 'About', href: '#about' },
              { label: 'Features', href: '#features' },
              { label: 'How It Works', href: '#how-it-works' },
              { label: 'Technology', href: '#technology' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color 0.1s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

          {isLanding ? (
            <button
              onClick={handleScrollToSearch}
              className="btn-primary"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                borderRadius: '4px',
              }}
            >
              Analyze
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Terminal Active
              </span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
