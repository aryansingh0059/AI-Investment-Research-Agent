'use client';

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSearch from '@/components/search/HeroSearch';
import LoadingScreen from '@/components/loading/LoadingScreen';
import ResultsDashboard from '@/components/dashboard/ResultsDashboard';
import Footer from '@/components/layout/Footer';
import { useAnalysis } from '@/hooks/useAnalysis';

export default function HomePage() {
  const analysis = useAnalysis();
  const [query, setQuery] = useState('');

  const handleAnalyze = (company: string) => {
    setQuery(company);
    analysis.analyze(company);
  };

  const handleReset = () => {
    analysis.reset();
    setQuery('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLogoClick={handleReset} />

      {/* Hero / Search */}
      {analysis.status === 'idle' && (
        <HeroSearch onAnalyze={handleAnalyze} />
      )}

      {/* Loading */}
      {(analysis.status !== 'idle' &&
        analysis.status !== 'complete' &&
        analysis.status !== 'error') && (
        <LoadingScreen
          status={analysis.status}
          message={analysis.currentMessage}
          steps={analysis.steps}
          elapsedMs={analysis.elapsedMs}
          company={query}
        />
      )}

      {/* Error */}
      {analysis.status === 'error' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="card max-w-lg w-full text-center animate-fade-in-up">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
            <p className="text-[var(--text-secondary)] mb-6">{analysis.error}</p>
            <button
              onClick={handleReset}
              className="btn-primary"
              style={{
                background: 'var(--gradient-brand)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis.status === 'complete' && analysis.result && (
        <ResultsDashboard
          result={analysis.result}
          company={query}
          elapsedMs={analysis.elapsedMs}
          onReset={handleReset}
        />
      )}

      <Footer />
    </div>
  );
}
