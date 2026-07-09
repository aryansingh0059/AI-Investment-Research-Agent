'use client';

import type { GraphState } from '@/lib/langgraph/state';
import { recommendationToColor } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

interface InvestmentCardProps {
  result: GraphState;
}

function ScoreItem({ score, label }: { score: number; label: string }) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
        {score}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
        {label}
      </div>
    </div>
  );
}

export default function InvestmentCard({ result }: InvestmentCardProps) {
  const rec = result.recommendation ?? 'WATCH';
  const scores = result.scores;
  const recColor = recommendationToColor(rec);

  const radarData = scores
    ? [
        { subject: 'Investment', value: scores.investment },
        { subject: 'Financial', value: scores.financialHealth },
        { subject: 'Safety', value: scores.riskScore },
        { subject: 'Growth', value: scores.growthScore },
        { subject: 'Confidence', value: scores.confidence },
      ]
    : [];

  const RecIcon = rec === 'INVEST' ? TrendingUp : rec === 'PASS' ? TrendingDown : Minus;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Recommendation Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>
              Investment Decision
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: 'var(--bg-surface)',
                  border: `1px solid ${recColor}40`,
                }}
              >
                <RecIcon size={14} color={recColor} />
                <span style={{ fontSize: '14px', fontWeight: 700, color: recColor, letterSpacing: '0.02em' }}>
                  {rec}
                </span>
              </div>
            </div>
          </div>

          {scores && (
            <div
              style={{
                textAlign: 'right',
                padding: '6px 12px',
                borderRadius: '4px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {scores.investment}
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Overall Score
              </div>
            </div>
          )}
        </div>

        {/* Flat Score Matrix (Replacing Rings) */}
        {scores && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              marginBottom: '20px',
            }}
          >
            <ScoreItem score={scores.financialHealth} label="Financial" />
            <ScoreItem score={scores.riskScore} label="Safety" />
            <ScoreItem score={scores.growthScore} label="Growth" />
            <ScoreItem score={scores.confidence} label="Confidence" />
          </div>
        )}
      </div>

      {/* Radar Chart */}
      {radarData.length > 0 && (
        <div style={{ height: '180px', marginTop: 'auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" radialLines={false} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 500 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="var(--brand-light)"
                fill="var(--brand-light)"
                fillOpacity={0.08}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
