# AdMatch — AI Landing Page Personalizer

> Drop in an ad creative + a landing page URL. AdMatch rewrites the page copy to match the ad's message, offer, and tone — without touching your layout or design.

---

## What it does

When a visitor clicks an ad and lands on a generic page, there's a disconnect between what the ad promised and what the page delivers. That gap kills conversions.

**AdMatch fixes it.**

It takes your ad creative and your existing landing page, then uses Gemini AI to surgically rewrite the page copy to match — preserving every pixel of your design.

| Input | Output |
|-------|--------|
| Ad image (upload or URL) + Landing page URL | Same page with AI-personalized copy + a change log explaining every edit |

---

## How it works

```
Ad Creative (image/URL)  +  Landing Page URL
              │
              ▼
   ┌─────────────────────┐
   │   Ad Analyzer       │  Gemini reads ad image → headline, offer,
   │                     │  CTA, tone, target audience, key messages
   └─────────┬───────────┘
             │
   ┌─────────▼───────────┐
   │   Page Scraper      │  Playwright fetches full HTML + screenshot
   └─────────┬───────────┘
             │
   ┌─────────▼───────────┐
   │   Page Analyzer     │  Gemini reads HTML + screenshot →
   │                     │  identifies editable elements + CSS selectors
   └─────────┬───────────┘
             │
   ┌─────────▼───────────┐
   │   Personalizer      │  Maps ad insights → page elements →
   │                     │  generates change plan (max 7 edits)
   └─────────┬───────────┘
             │
   ┌─────────▼───────────┐
   │   Validator         │  Checks every selector exists in DOM,
   │                     │  blocks nav / footer / forms / legal text
   └─────────┬───────────┘
             │
   ┌─────────▼───────────┐
   │   HTML Editor       │  BeautifulSoup applies text-only swaps
   │                     │  (zero structural or CSS changes)
   └─────────┬───────────┘
             │
             ▼
   Personalized HTML  →  served at /api/preview/{session_id}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python) |
| Page scraping | Playwright (headless Chromium) |
| HTML editing | BeautifulSoup4 |
| AI | Google Gemini via `google-genai` SDK |
| Schemas / validation | Pydantic v2 |

---

## Project Structure

```
admatch/
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.tsx         # Ad upload + URL inputs
│   │   │   ├── ResultViewer.tsx      # Side-by-side iframe preview
│   │   │   └── DiffPanel.tsx         # Change log with CRO reasons
│   │   └── api/client.ts             # API calls
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── backend/
│   ├── main.py                       # FastAPI routes + orchestration
│   ├── schemas.py                    # Pydantic models
│   ├── agents/
│   │   ├── ad_analyzer.py            # Gemini: reads ad → structured insights
│   │   ├── page_analyzer.py          # Gemini: reads page → editable elements
│   │   ├── personalizer.py           # Gemini: generates change plan
│   │   └── validator.py              # Validates changes against real DOM
│   ├── utils/
│   │   ├── scraper.py                # Playwright: fetch HTML + screenshot
│   │   └── html_editor.py            # BeautifulSoup: apply text swaps
│   ├── Dockerfile                    # For Railway deployment
│   └── requirements.txt
├── start.sh                          # Run both servers locally
└── README.md
```

---

## Robustness

| Risk | How we handle it |
|------|-----------------|
| **Hallucinations** | All AI outputs are validated against a strict Pydantic schema. Every CSS selector is checked against the actual DOM before any change is applied. |
| **Broken UI** | Only `innerText` is ever changed — zero structural edits, zero CSS changes. Nav, footer, forms, and legal text are blocked by an allowlist. |
| **Inconsistent output** | Temperature set to 0.2 on all agents. Retries once on schema validation failure. Max 7 changes enforced. |
| **Excessive changes** | Strict tag allowlist (`h1`, `h2`, `h3`, `p`, `button`, `a`, `span` only). All selectors validated against the live DOM. Hard cap of 7 changes per run. |

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Gemini API key](https://aistudio.google.com/app/apikey) (free tier works)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/admatch.git
cd admatch
cd frontend && npm install && cd ..
```

### 2. Set up backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
# Edit .env — add your GEMINI_API_KEY
```

### 3. Run

```bash
cd ..
./start.sh
```

Open **http://localhost:5173**

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/personalize` | Main endpoint. Accepts `page_url`, `ad_url` or `ad_file` (multipart). Returns `session_id`, `changes[]`, `summary`, `modified_html` |
| `GET` | `/api/preview/{session_id}` | Serves the full personalized HTML page |
| `GET` | `/api/health` | Health check |

---

## Deployment

### Backend → Railway

1. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
2. Set **Root Directory** to `backend/`
3. Railway auto-detects the `Dockerfile`
4. Add environment variables:
   - `GEMINI_API_KEY` — your Gemini API key
   - `GEMINI_MODEL` — e.g. `gemini-2.0-flash`
5. Copy your Railway public URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project → Import from GitHub**
2. Set **Root Directory** to `frontend/`
3. Add environment variable:
   - `VITE_API_BASE_URL` — your Railway backend URL
4. Deploy
