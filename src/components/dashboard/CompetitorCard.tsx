'use client';

import type { Competitor } from '@/types/company';
import { formatCurrency } from '@/lib/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CompetitorCardProps {
  competitors: Competitor[];
  currentSymbol?: string;
}

const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#22c55e', '#f59e0b'];

export default function CompetitorCard({ competitors, currentSymbol }: CompetitorCardProps) {
  if (competitors.length === 0) {
    return (
      <div className="card animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Competitor Analysis</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Competitor data unavailable. Requires FINNHUB_API_KEY.
        </p>
      </div>
    );
  }

  const chartData = competitors
    .filter((c) => c.marketCap)
    .map((c, i) => ({
      name: c.symbol,
      'Market Cap ($B)': parseFloat(((c.marketCap ?? 0) / 1e9).toFixed(1)),
      color: COLORS[i % COLORS.length],
    }));

  return (
    <div className="card animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Competitors</h2>

      {/* Table */}
      <div
        style={{
          borderRadius: '10px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: '20px',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)' }}>
              {['Company', 'Symbol', 'Market Cap', 'Price'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 12px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    textAlign: 'left',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c, i) => (
              <tr
                key={c.symbol}
                style={{ borderBottom: i < competitors.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {c.name ?? c.symbol}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span className="badge badge-brand">{c.symbol}</span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {formatCurrency(c.marketCap)}
                </td>
                <td style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {c.currentPrice ? `$${c.currentPrice.toFixed(2)}` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: 'var(--text-muted)' }}>
            Market Cap Comparison ($B)
          </h3>
          <div style={{ height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={16}>
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Market Cap ($B)" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
