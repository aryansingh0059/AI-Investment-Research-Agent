import type { NextConfig } from "next";

// ── Corporate proxy / VPN environments inject self-signed certificates into
// TLS chains, which causes all outbound HTTPS fetch calls to fail with
// SELF_SIGNED_CERT_IN_CHAIN. Disabling strict verification fixes this for
// all Node.js HTTP(S) traffic in the dev server and API routes.
// NOTE: Remove this line if deploying to a production environment where the
// cert chain is trusted (e.g. Vercel, Railway, AWS).
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'static.finnhub.io' },
      { hostname: 'logo.clearbit.com' },
      { hostname: 'storage.googleapis.com' },
    ],
  },
  serverExternalPackages: [
    'undici',
    '@langchain/core',
    '@langchain/google-genai',
    '@langchain/langgraph',
    '@langchain/community',
  ],
};

export default nextConfig;
