/**
 * Utility: number formatters
 */

export function formatCurrency(
  value: number | undefined | null,
  currency = 'USD',
  compact = true
): string {
  if (value == null) return 'N/A';
  if (compact) {
    if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
}

export function formatPercent(value: number | undefined | null, decimals = 1): string {
  if (value == null) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number | undefined | null, decimals = 2): string {
  if (value == null) return 'N/A';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value);
}

export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatMarketCap(value: number | undefined | null): string {
  return formatCurrency(value, 'USD', true);
}

export function scoreToColor(score: number): string {
  if (score >= 70) return '#22c55e'; // green
  if (score >= 50) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function scoreToLabel(score: number): string {
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Weak';
}

export function riskLevelToColor(level: 'low' | 'medium' | 'high'): string {
  switch (level) {
    case 'low': return '#22c55e';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
  }
}

export function impactToColor(impact: 'low' | 'medium' | 'high'): string {
  switch (impact) {
    case 'low': return '#94a3b8';
    case 'medium': return '#3b82f6';
    case 'high': return '#22c55e';
  }
}

export function recommendationToColor(rec: string): string {
  switch (rec) {
    case 'INVEST': return '#22c55e';
    case 'WATCH': return '#f59e0b';
    case 'PASS': return '#ef4444';
    default: return '#94a3b8';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
