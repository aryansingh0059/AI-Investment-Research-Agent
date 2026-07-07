'use client';

import type { CompanyProfile } from '@/types/company';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { Building2, Globe, Users, MapPin, Tag, Award, User } from 'lucide-react';
import Image from 'next/image';

interface CompanyCardProps {
  profile?: CompanyProfile;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--brand)', marginTop: '1px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
          {String(value)}
        </div>
      </div>
    </div>
  );
}

export default function CompanyCard({ profile }: CompanyCardProps) {
  if (!profile) {
    return (
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Company Overview</h2>
        <p style={{ color: 'var(--text-muted)' }}>Company profile data unavailable</p>
      </div>
    );
  }

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
        {profile.logo ? (
          <div
            style={{
              width: '60px', height: '60px', borderRadius: '14px',
              background: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
              border: '1px solid var(--border)',
            }}
          >
            <img
              src={profile.logo}
              alt={profile.name}
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ) : (
          <div
            style={{
              width: '60px', height: '60px', borderRadius: '14px',
              background: 'var(--gradient-brand)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Building2 size={28} color="white" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px', wordBreak: 'break-word' }}>
            {profile.name ?? 'Unknown Company'}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profile.symbol && (
              <span className="badge badge-brand">{profile.symbol}</span>
            )}
            {profile.exchange && (
              <span className="badge badge-neutral">{profile.exchange}</span>
            )}
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
          marginBottom: '16px',
        }}
      >
        {[
          {
            label: 'Market Cap',
            value: profile.marketCap ? formatCurrency(profile.marketCap) : 'N/A',
            color: 'var(--brand)',
          },
          {
            label: 'Stock Price',
            value: profile.currentPrice ? `$${profile.currentPrice.toFixed(2)}` : 'N/A',
            color: 'var(--accent)',
          },
        ].map((m) => (
          <div
            key={m.label}
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div>
        <InfoRow icon={<User size={14} />} label="CEO" value={profile.ceo} />
        <InfoRow icon={<Tag size={14} />} label="Industry" value={profile.industry} />
        <InfoRow icon={<Award size={14} />} label="Sector" value={profile.sector} />
        <InfoRow icon={<MapPin size={14} />} label="Country" value={profile.country} />
        <InfoRow icon={<Users size={14} />} label="Employees" value={profile.employees ? formatNumber(profile.employees, 0) : undefined} />
        {profile.website && (
          <div style={{ padding: '10px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Globe size={14} style={{ color: 'var(--brand)', flexShrink: 0 }} />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--brand-light)', fontSize: '14px', textDecoration: 'none' }}
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {profile.description && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}
        >
          {profile.description.slice(0, 300)}{profile.description.length > 300 ? '...' : ''}
        </div>
      )}
    </div>
  );
}
