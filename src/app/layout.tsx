import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Investment Research Agent',
  description:
    'Professional AI-powered investment analysis. Enter a company name and get a comprehensive equity research report with SWOT analysis, risk assessment, financial metrics, and an investment recommendation — all in seconds.',
  keywords: ['investment research', 'AI', 'stock analysis', 'equity research', 'financial analysis'],
  openGraph: {
    title: 'AI Investment Research Agent',
    description: 'Professional AI-powered investment analysis in seconds.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
