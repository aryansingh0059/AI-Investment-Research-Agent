import { NextRequest } from 'next/server';
import { generateWithAI } from '@/lib/services/ai';

/**
 * POST /api/chat
 * Request body: { "company": "Apple", "context": "...", "question": "..." }
 * Response: { "answer": "..." }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, context, question } = body;

    if (!question) {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a professional equity analyst assisting a client with questions about ${company}. Answer the question concisely using the provided context. If the information is not in the context, use your general financial knowledge to answer neutrally. Keep answers under 120 words. Format as plain text.`;
    const userMessage = `Context: ${context}\n\nQuestion: ${question}`;

    const response = await generateWithAI(systemPrompt, userMessage, 0.2);

    return new Response(JSON.stringify({ answer: response?.text || 'No response generated.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[API /api/chat] Error:', err);
    return new Response(JSON.stringify({ error: 'Failed to process follow-up question' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
