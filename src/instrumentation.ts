/**
 * Next.js Instrumentation Hook — runs once on server startup before any routes.
 *
 * Patches the Node.js global HTTPS agent to disable TLS certificate verification.
 * This covers all http/https module-based calls (node-fetch, axios, got, etc.)
 *
 * Note: NODE_TLS_REJECT_UNAUTHORIZED=0 is also set in next.config.ts which
 * handles native fetch (undici) and yahoo-finance2's internal HTTP client.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const https = await import('https');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (https.globalAgent as any).options.rejectUnauthorized = false;
    console.log('[Instrumentation] HTTPS globalAgent patched — TLS verification disabled for corporate proxy');
  }
}
