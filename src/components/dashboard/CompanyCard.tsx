'use client';

import type { CompanyProfile } from '@/types/company';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { Building2, Globe, Users, MapPin, Tag, Award, User } from 'lucide-react';

interface CompanyCardProps {
  profile?: CompanyProfile;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  if (value == null || value === '') return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ color: 'var(--brand-light)', marginTop: '2px', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
          {String(value)}
        </div>
      </div>
    </div>
  );
}

export default function CompanyCard({ profile }: CompanyCardProps) {
  if (!profile) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Company Overview</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Company profile data unavailable</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          {profile.logo ? (
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '6px',
                background: 'white', display: 'flex', alignItems: 'center',
                justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                border: '1px solid var(--border)',
              }}
            >
              <img
                src={profile.logo}
                alt={profile.name}
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          ) : (
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '6px',
                background: 'var(--bg-surface)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                border: '1px solid var(--border)',
              }}
            >
              <Building2 size={20} color="var(--text-secondary)" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, wordBreak: 'break-word', color: 'var(--text-primary)' }}>
              {profile.name ?? 'Unknown Company'}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
              {profile.symbol && (
                <span className="badge badge-brand" style={{ fontSize: '10px' }}>{profile.symbol}</span>
              )}
              {profile.exchange && (
                <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{profile.exchange}</span>
              )}
            </div>
          </div>
        </div>

        {/* MCap and Price stats grid */}
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
              color: 'var(--text-primary)',
            },
            {
              label: 'Stock Price',
              value: profile.currentPrice ? `$${profile.currentPrice.toFixed(2)}` : 'N/A',
              color: 'var(--brand-light)',
            },
          ].map((m) => (
            <div
              key={m.label}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Details Row */}
        <div>
          <InfoRow icon={<User size={13} />} label="CEO" value={profile.ceo} />
          <InfoRow icon={<Tag size={13} />} label="Industry" value={profile.industry} />
          <InfoRow icon={<Award size={13} />} label="Sector" value={profile.sector} />
          <InfoRow icon={<MapPin size={13} />} label="Headquarters" value={profile.headquarters} />
          <InfoRow icon={<Users size={13} />} label="Employees" value={profile.employees ? formatNumber(profile.employees, 0) : undefined} />
          {profile.website && (
            <div style={{ padding: '8px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Globe size={13} style={{ color: 'var(--brand-light)', flexShrink: 0 }} />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--brand-light)', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}
              >
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>
      </div>

      {profile.description && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
          }}
        >
          {profile.description.slice(0, 240)}{profile.description.length > 240 ? '...' : ''}
        </div>
      )}
    </div>
  );
}
