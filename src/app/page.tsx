'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import HeroSearch from '@/components/search/HeroSearch';
import LoadingScreen from '@/components/loading/LoadingScreen';
import ResultsDashboard from '@/components/dashboard/ResultsDashboard';
import CompanyNotFound from '@/components/search/CompanyNotFound';
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
      <Navbar onLogoClick={handleReset} status={analysis.status} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <AnimatePresence mode="wait">
          {/* Hero / Search */}
          {analysis.status === 'idle' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <HeroSearch onAnalyze={handleAnalyze} />
            </motion.div>
          )}

          {/* Loading */}
          {analysis.status !== 'idle' &&
            analysis.status !== 'complete' &&
            analysis.status !== 'error' &&
            analysis.status !== 'company_not_found' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <LoadingScreen
                  status={analysis.status}
                  message={analysis.currentMessage}
                  steps={analysis.steps}
                  elapsedMs={analysis.elapsedMs}
                  company={query}
                />
              </motion.div>
          )}

          {/* Company Not Found */}
          {analysis.status === 'company_not_found' && (
            <motion.div
              key="company_not_found"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <CompanyNotFound
                searchedQuery={query}
                message={analysis.error ?? undefined}
                onAnalyze={handleAnalyze}
                onReset={handleReset}
              />
            </motion.div>
          )}

          {/* Error */}
          {analysis.status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}
            >
              <div className="card max-w-lg w-full text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
                <p className="text-[var(--text-secondary)] mb-6">{analysis.error}</p>
                <button
                  onClick={handleReset}
                  className="btn-primary"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Try Again
                </button>
              </div>
            </motion.div>
          )}


          {/* Results */}
          {analysis.status === 'complete' && analysis.result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <ResultsDashboard
                result={analysis.result}
                company={query}
                elapsedMs={analysis.elapsedMs}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
