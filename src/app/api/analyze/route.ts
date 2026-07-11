import { NextRequest } from 'next/server';
import { runAnalysis } from '@/lib/langgraph/graph';
import { getCached, setCached } from '@/lib/utils/cache';
import type { GraphState } from '@/lib/langgraph/state';
import type { AnalysisStep } from '@/types/recommendation';

/**
 * POST /api/analyze
 *
 * Request body: { "company": "Apple" }
 * Response: text/event-stream (SSE)
 *
 * Events:
 *   data: { "step": "company_research", "message": "...", "data": {} }
 *   data: { "step": "complete", "message": "...", "data": <full AnalysisResult> }
 *   data: { "step": "error", "message": "...", "error": "..." }
 */
export async function POST(req: NextRequest) {
  let company: string;

  try {
    const body = await req.json();
    company = (body?.company ?? '').trim();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!company || company.length < 1) {
    return new Response(JSON.stringify({ error: 'Company name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (company.length > 100) {
    return new Response(JSON.stringify({ error: 'Company name too long' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Setup SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (step: AnalysisStep, message: string, data?: Partial<GraphState>) => {
        const event = JSON.stringify({ step, message, data: data ?? {} });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      };

      try {
        // Check cache first
        const cached = getCached<GraphState>(company);
        if (cached) {
          send('complete', 'Retrieved from cache', cached);
          controller.close();
          return;
        }

        // Run the LangGraph pipeline with progress streaming
        const result = await runAnalysis(company, (step, message, partialState) => {
          send(step, message, partialState);
        });

        // ── Company validation failed — do not cache, do not show results ──
        if (result.companyValid === false) {
          const event = JSON.stringify({
            step: 'company_not_found',
            code: 'COMPANY_NOT_FOUND',
            message: result.validationError ?? 'No publicly listed company was found matching your search.',
            success: false,
          });
          controller.enqueue(encoder.encode(`data: ${event}\n\n`));
          controller.close();
          return;
        }

        // Cache the result
        setCached(company, result);

        // Final event with full result
        send('complete', 'Analysis complete!', result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        console.error('[API /api/analyze] Error:', err);
        const event = JSON.stringify({ step: 'error', message, error: message });
        controller.enqueue(encoder.encode(`data: ${event}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
