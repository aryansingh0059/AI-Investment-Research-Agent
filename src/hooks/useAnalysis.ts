'use client';

import { useState, useCallback, useRef } from 'react';
import type { GraphState } from '@/lib/langgraph/state';
import type { AnalysisStep } from '@/types/recommendation';
import { ANALYSIS_STEP_LABELS } from '@/constants';

export interface AnalysisState {
  status: AnalysisStep;
  currentMessage: string;
  result: GraphState | null;
  error: string | null;
  steps: { step: AnalysisStep; message: string; timestamp: number }[];
  elapsedMs: number;
}

const INITIAL_STATE: AnalysisState = {
  status: 'idle',
  currentMessage: '',
  result: null,
  error: null,
  steps: [],
  elapsedMs: 0,
};

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(INITIAL_STATE);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const analyze = useCallback(async (company: string) => {
    // Cancel any in-progress request
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    clearTimer();

    setState({
      ...INITIAL_STATE,
      status: 'company_research',
      currentMessage: 'Starting analysis...',
    });

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        elapsedMs: Date.now() - startTimeRef.current,
      }));
    }, 100);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr) as {
              step: AnalysisStep;
              message: string;
              data?: GraphState;
              error?: string;
            };

            if (event.step === 'error') {
              clearTimer();
              setState((prev) => ({
                ...prev,
                status: 'error',
                error: event.error ?? event.message,
                currentMessage: event.message,
              }));
              return;
            }

            if (event.step === 'complete' && event.data) {
              clearTimer();
              setState((prev) => ({
                ...prev,
                status: 'complete',
                currentMessage: 'Analysis complete!',
                result: event.data as GraphState,
                elapsedMs: Date.now() - startTimeRef.current,
                steps: [
                  ...prev.steps,
                  { step: event.step, message: event.message, timestamp: Date.now() },
                ],
              }));
              return;
            }

            setState((prev) => ({
              ...prev,
              status: event.step,
              currentMessage: event.message,
              steps: [
                ...prev.steps,
                { step: event.step, message: event.message, timestamp: Date.now() },
              ],
            }));
          } catch {
            // Ignore malformed SSE events
          }
        }
      }
    } catch (err) {
      clearTimer();
      if ((err as Error).name === 'AbortError') return;
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Analysis failed',
        currentMessage: 'An error occurred',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    clearTimer();
    setState(INITIAL_STATE);
  }, []);

  const stepLabel = ANALYSIS_STEP_LABELS[state.status] ?? state.currentMessage;

  return { ...state, stepLabel, analyze, reset };
}
