# AI Investment Research Agent

An AI-powered equity research agent that performs comprehensive investment analysis on any publicly traded company. Enter a company name, and within ~30 seconds you'll receive a full investment report — complete with financial analysis, news sentiment, SWOT, risk scoring, competitor benchmarking, and an AI-generated investment recommendation.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛡️ **Company Validation** | Resolves company symbol and validates ticker existence before running full analysis |
| 🏢 **Company Research** | Full profile: logo, sector, CEO, market cap, stock price |
| 📊 **Financial Analysis** | Revenue, net income, EPS, FCF, margins, ratios, PE, ROE — with interactive charts |
| 📰 **News Analysis** | Latest 5–8 news articles with per-article sentiment scoring |
| 🔍 **Web Research** | Tavily AI web search for growth, AI initiatives, competition insights |
| ⚡ **Competitor Analysis** | Peer companies with market cap comparison chart |
| 🧠 **AI SWOT** | AI-generated Strengths, Weaknesses, Opportunities, Threats |
| 🛡️ **Risk Scoring** | 7-category risk assessment with severity levels |
| 🚀 **Growth Analysis** | AI-identified growth drivers and expansion opportunities |
| 🎯 **Investment Recommendation** | INVEST / WATCH / PASS with 5 quantitative scores |
| 💬 **AI Reasoning** | Detailed, evidence-based analyst narrative |
| 📄 **Export** | PDF snapshot and Markdown report download |

---

## 🏗️ Architecture

```
Browser (Next.js 15 / React / Tailwind)
        │
        │  POST /api/analyze  (SSE streaming)
        ▼
Next.js API Route ──► LangGraph 10-Node Pipeline
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         Finnhub          FMP         NewsAPI
         (Profile,     (Financials)  (News)
          Metrics,
          Peers)
                        Tavily        Gemini
                       (Web Search)  (AI Analysis)
```

### LangGraph Pipeline

```
START
  ↓ companyValidator     ← Verify company existence and resolve symbol
  ↓ companyResearch      ← Finnhub: profile information
  ↓ financialAnalysis    ← FMP: income stmt, balance sheet, cash flow
  ↓ newsAnalysis ──┐     ← NewsAPI: articles + lexicon sentiment
  ↓ webSearch     ─┘     ← Tavily: parallel batch searches (parallel with news)
  ↓ competitorAnalysis   ← Finnhub: peers
  ↓ riskAnalysis ──┐     ← Gemini: 7-category risk assessment
  ↓ growthAnalysis─┘     ← Gemini: growth drivers (parallel with risk)
  ↓ swotGenerator        ← Gemini: SWOT synthesis
  ↓ decisionEngine       ← Gemini: final recommendation + scores + reasoning
END
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| State Machine | LangGraph (custom `runAnalysis` pipeline) |
| AI | Google Gemini 1.5 Flash |
| Charts | Recharts |
| Financial Data | Finnhub + Financial Modeling Prep |
| News | NewsAPI |
| Web Search | Tavily |
| Package Manager | npm |
| Deployment | Vercel |

---

## 📁 Folder Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + SEO
│   ├── globals.css               # Design system
│   ├── not-found.tsx             # 404 page
│   └── api/analyze/route.ts      # SSE streaming API route
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── search/                   # HeroSearch
│   ├── loading/                  # LoadingScreen with step progress
│   └── dashboard/                # All result cards + charts
├── lib/
│   ├── langgraph/                # State machine + 9 nodes
│   ├── services/                 # Finnhub, FMP, NewsAPI, Tavily, Gemini
│   ├── prompts/                  # AI prompt templates
│   └── utils/                    # Formatters, cache, export
├── types/                        # All TypeScript interfaces
├── hooks/                        # useAnalysis (SSE)
└── constants/                    # API URLs, scoring weights, labels
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- npm 9+
- API keys (see below)

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/ai-investment-agent
cd ai-investment-agent

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local
# (see Environment Variables section below)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

| Variable | Service | Free Tier |
|---|---|---|
| `FINNHUB_API_KEY` | [Finnhub](https://finnhub.io) | ✅ Yes |
| `FMP_API_KEY` | [Financial Modeling Prep](https://financialmodelingprep.com) | ✅ Yes |
| `NEWS_API_KEY` | [NewsAPI](https://newsapi.org) | ✅ Yes |
| `TAVILY_API_KEY` | [Tavily](https://tavily.com) | ✅ Yes |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) | ✅ Yes |

> **Note:** The app performs graceful degradation — if any API key is missing, that section shows an "unavailable" message while the rest of the analysis continues.

---

## 🎯 How to Run

```bash
# Development
npm run dev

# Type checking
npx tsc --noEmit

# Production build
npm run build
npm start
```

---

## ⚖️ Trade-offs & Design Decisions

### Sequential vs Parallel Execution
The LangGraph pipeline runs mostly sequentially to maintain data dependency order. However, `newsAnalysis` and `webSearch` run in parallel (both independent of each other), and `riskAnalysis` and `growthAnalysis` also run in parallel, cutting total time by ~20-30%.

### SSE over WebSockets
Server-Sent Events are used for progress streaming. They're simpler than WebSockets for a one-way server→client flow, and work with Next.js API routes without additional infrastructure.

### Direct REST over SDK
The Gemini service uses the REST API directly rather than the `@google/generative-ai` SDK to avoid adding a heavy dependency just for one service. This also makes the timeout and error handling explicit.

### Rule-Based Fallbacks
Every AI node has a rule-based fallback (using financial ratios, news sentiment counts, etc.) that activates if the Gemini API is unavailable. This means the app is always functional even without an AI key.

### In-Memory Cache
A simple Map-based cache (30 min TTL) prevents re-running the full pipeline for the same company within a session. For production, replace with Redis.

---

## 🔮 Future Improvements

- [ ] Company comparison mode (side-by-side analysis)
- [ ] Investment history / portfolio tracking
- [ ] AI follow-up chat (ask questions about the report)
- [ ] Shareable report URLs (persist to database)
- [ ] Real-time stock price websocket feed
- [ ] Redis caching for production deployment
- [ ] Token-level streaming of the AI reasoning
- [ ] Source citations for every insight
- [ ] Mobile app (React Native)

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard:
# Settings → Environment Variables → Add all 5 keys
```

---

## ⚠️ Disclaimer

This application is for **research and educational purposes only**. It is **not financial advice**. Always conduct your own due diligence and consult a qualified financial advisor before making investment decisions. AI-generated analysis can be incorrect or incomplete.

---

## 📝 License

MIT
