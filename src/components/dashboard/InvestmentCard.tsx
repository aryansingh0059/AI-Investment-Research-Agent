'use client';

import type { GraphState } from '@/lib/langgraph/state';
import type { Scores } from '@/types/recommendation';
import { recommendationToColor, scoreToColor } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

interface InvestmentCardProps {
  result: GraphState;
}

function ScoreRing({ score, label, size = 80 }: { score: number; label: string; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = scoreToColor(score);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fill={color}
          fontSize="14"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {score}
        </text>
      </svg>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</div>
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
    <div
      className="card animate-fade-in-up"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${recColor}20 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AI Recommendation
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: `${recColor}20`,
                  border: `1px solid ${recColor}40`,
                }}
              >
                <RecIcon size={22} color={recColor} />
                <span style={{ fontSize: '24px', fontWeight: 900, color: recColor, letterSpacing: '0.05em' }}>
                  {rec}
                </span>
              </div>
            </div>
          </div>

          {scores && (
            <div
              style={{
                textAlign: 'center',
                padding: '12px 20px',
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontSize: '32px', fontWeight: 900, color: scoreToColor(scores.investment) }}>
                {scores.investment}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Investment Score</div>
            </div>
          )}
        </div>

        {/* Score rings */}
        {scores && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            <ScoreRing score={scores.financialHealth} label="Financial" />
            <ScoreRing score={scores.riskScore} label="Safety" />
            <ScoreRing score={scores.growthScore} label="Growth" />
            <ScoreRing score={scores.confidence} label="Confidence" />
          </div>
        )}

        {/* Radar chart */}
        {radarData.length > 0 && (
          <div style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="var(--brand)"
                  fill="var(--brand)"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
