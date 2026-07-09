'use client';

import type { Competitor } from '@/types/company';
import { formatCurrency } from '@/lib/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CompetitorCardProps {
  competitors: Competitor[];
  currentSymbol?: string;
}

export default function CompetitorCard({ competitors, currentSymbol }: CompetitorCardProps) {
  if (competitors.length === 0) {
    return (
      <div className="card">
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>Competitor Analysis</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Competitor data unavailable.
        </p>
      </div>
    );
  }

  const chartData = competitors
    .filter((c) => c.marketCap)
    .map((c) => ({
      name: c.symbol,
      'Market Cap ($B)': parseFloat(((c.marketCap ?? 0) / 1e9).toFixed(1)),
    }));

  return (
    <div className="card">
      <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Competitor Matrix</h2>

      {/* Flat Table Component */}
      <div className="table-container" style={{ marginBottom: '16px' }}>
        <table className="table-element">
          <thead>
            <tr>
              {['Symbol', 'Company', 'Market Cap', 'Price'].map((h) => (
                <th key={h} className="table-th">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.symbol} className="table-tr">
                <td className="table-td" style={{ fontWeight: 600 }}>
                  <span className="badge badge-neutral" style={{ fontSize: '10px' }}>{c.symbol}</span>
                </td>
                <td className="table-td" style={{ color: 'var(--text-primary)' }}>
                  {c.name ?? c.symbol}
                </td>
                <td className="table-td" style={{ fontFamily: 'var(--font-mono)' }}>
                  {formatCurrency(c.marketCap)}
                </td>
                <td className="table-td" style={{ fontFamily: 'var(--font-mono)' }}>
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
          <h3 style={{ fontSize: '11px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Market Capitalization ($B)
          </h3>
          <div style={{ height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={12}>
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="Market Cap ($B)" fill="#2563EB" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
