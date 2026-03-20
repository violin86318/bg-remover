# BG Remover

> Remove image backgrounds instantly with AI. Free, fast, and no signup required.

## Features

- ⚡ **Lightning Fast** — AI-powered background removal in 3–5 seconds
- 🔒 **100% Privacy Safe** — Images never stored or logged
- 🎯 **Precise Edges** — Handles hair, fur, and complex edges
- 💰 **Free to Use** — No signup, no credit card
- 🌙 **Dark Mode** — Beautiful dark theme with glassmorphism UI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Custom CSS (design system) |
| Backend | Cloudflare Pages Function |
| API | Remove.bg |
| Deploy | Cloudflare Pages |
| Domain | 1986318.xyz |

## Architecture

```
User Browser
    │  POST /api/remove-bg
    ▼
Cloudflare Pages (Static)
    │
    ▼
Cloudflare Pages Function (API proxy)
    │  Forwards to Remove.bg — API key kept server-side
    ▼
Remove.bg API → Returns PNG
    │
    ▼
User Downloads Result
```

## Local Development

```bash
# 1. Clone & install
git clone https://github.com/violin86318/bg-remover.git
cd bg-remover
npm install

# 2. Add your Remove.bg API key
echo "REMOVE_BG_API_KEY=your_key_here" > .dev.vars

# 3. Start dev server
npm run dev
```

The frontend dev server proxies `/api/*` to port 8787 where the Pages Function runs.

## Deploy to Cloudflare Pages

### Option A: GitHub Auto-Deploy (Recommended)
1. Push to GitHub — Cloudflare auto-deploys on push to `main`
2. In Cloudflare Dashboard → Pages → your project → **Settings → Environment Variables**
3. Add: `REMOVE_BG_API_KEY` = your Remove.bg API key

### Option B: Manual Deploy
```bash
npm run build
npx wrangler pages deploy dist
```

## Cloudflare DNS Setup (1986318.xyz)

1. Cloudflare Dashboard → your domain → **DNS**
2. Add a **CNAME** record:
   - Name: `bg-remover` (or `@` for root)
   - Target: `bg-remover.pages.dev`
   - Proxy: ✅ ON (Proxied)
3. In Pages → your project → **Custom Domains** → add `1986318.xyz`

## Remove.bg API Quotas

| Plan | Monthly | Price |
|------|---------|-------|
| Free | 50 calls | $0 |
| Pay-as-you-go | Unlimited | $0.12/call |
| Pro | 5,000 calls | $49/mo |

## Project Structure

```
bg-remover/
├── functions/
│   └── api/
│       └── remove-bg.js     # Cloudflare Pages Function (API proxy)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── ImageProcessor.jsx
│   │   ├── Features.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── FAQ.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── wrangler.toml
└── README.md
```

## License

MIT
