import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'static.finnhub.io' },
      { hostname: 'logo.clearbit.com' },
      { hostname: 'storage.googleapis.com' },
    ],
  },
  serverExternalPackages: [
    '@langchain/core',
    '@langchain/google-genai',
    '@langchain/langgraph',
    '@langchain/community',
  ],
};

export default nextConfig;
