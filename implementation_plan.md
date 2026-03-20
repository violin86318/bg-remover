# Image Background Remover Website

Build a modern, visually stunning single-page website for the keyword **"image background remover"**. Users can upload images, remove backgrounds via the Remove.bg API, and download the result. Deployed on Cloudflare Pages with a Pages Function as API proxy (keeps the API key server-side).

## Architecture

```
┌──────────────────────────────┐
│   Cloudflare Pages (Static)  │
│   Vite + React SPA           │
│   - Upload UI                │
│   - Before/After preview     │
│   - Download result          │
└──────────┬───────────────────┘
           │ POST /api/remove-bg
           ▼
┌──────────────────────────────┐
│   Cloudflare Pages Function  │
│   functions/api/remove-bg.js │
│   - Receives image from FE   │
│   - Forwards to Remove.bg    │
│   - Returns result to FE     │
└──────────┬───────────────────┘
           │ POST https://api.remove.bg/v1.0/removebg
           ▼
┌──────────────────────────────┐
│   Remove.bg API              │
└──────────────────────────────┘
```

## User Review Required

> [!IMPORTANT]
> The Remove.bg API key will be stored as a Cloudflare environment variable (`REMOVE_BG_API_KEY`). You'll need to set this in your Cloudflare Pages dashboard after deployment: **Settings → Environment Variables → Add `REMOVE_BG_API_KEY`**.

> [!NOTE]
> Remove.bg offers **50 free API calls/month**. For local development, you can create a `.dev.vars` file with your API key (this file is gitignored).

## Proposed Changes

### Project Scaffolding

#### [NEW] [bg-remover/](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/)

Scaffold a new Vite + React project at `/Users/wanglingwei/Documents/Antigravity/websites/bg-remover/` using `npx create-vite`.

---

### Design System & Global Styles

#### [NEW] [index.css](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/index.css)

Modern design system with CSS variables:
- **Color palette**: Deep navy/dark backgrounds (`#0a0a1a`, `#12122a`), vibrant purple-blue gradients (`#7c3aed` → `#3b82f6`) for accents
- **Typography**: Google Fonts — `Inter` for body, `Space Grotesk` for headings
- **Glassmorphism**: Frosted glass cards with `backdrop-filter: blur()`
- **Animations**: Smooth transitions, hover effects, pulse/glow keyframes
- **Responsive**: Mobile-first with fluid typography using `clamp()`

---

### Core Components

#### [NEW] [App.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/App.jsx)

Main app component orchestrating all sections. Manages global state for the image processing workflow:
- `selectedFile` — the uploaded file
- `originalPreview` — original image data URL
- `processedImage` — result blob URL
- `status` — `idle | uploading | processing | done | error`

#### [NEW] [Header.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/Header.jsx)

Sticky navbar with logo, nav links (Features, How It Works, FAQ), and a CTA button. Glassmorphism style, shrinks on scroll.

#### [NEW] [Hero.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/Hero.jsx)

Hero section with:
- H1: "Remove Image Background Instantly"
- Subtitle emphasizing free/AI-powered
- Large drag-and-drop upload zone with dashed border animation
- Accepted formats: JPG, PNG, WebP (max 12MB)
- Background particle/gradient animation

#### [NEW] [ImageProcessor.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/ImageProcessor.jsx)

Core processing component:
- **Before/After slider** — draggable divider comparing original and processed images
- **Processing state** — lottie-style CSS loading animation with progress text
- **Action buttons** — "Download PNG", "Try Another Image"
- **Error state** — user-friendly error message with retry button
- Checkered transparency background for processed image

#### [NEW] [Features.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/Features.jsx)

Feature highlights grid (3-4 cards):
- ⚡ Fast Processing — AI-powered in seconds
- 🔒 Privacy Safe — images processed securely
- 🎯 Precise Edges — hair, fur, complex edges
- 💰 Free to Use — no signup required

#### [NEW] [HowItWorks.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/HowItWorks.jsx)

3-step visual guide:
1. Upload your image
2. AI removes the background
3. Download the result

Animated step connectors with numbered circles.

#### [NEW] [FAQ.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/FAQ.jsx)

Accordion-style FAQ covering SEO long-tail keywords:
- "What image formats are supported?"
- "Is it free to remove backgrounds?"
- "How does the AI background removal work?"
- "Is my image data safe?"
- "What is the maximum file size?"

#### [NEW] [Footer.jsx](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/src/components/Footer.jsx)

Minimal footer with copyright, links, and branding.

---

### Cloudflare Pages Function (API Proxy)

#### [NEW] [remove-bg.js](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/functions/api/remove-bg.js)

Cloudflare Pages Function acting as API proxy:
- Accepts POST with multipart/form-data (image file)
- Reads `REMOVE_BG_API_KEY` from environment variables
- Forwards image to `https://api.remove.bg/v1.0/removebg`
- Returns the processed PNG binary to the frontend
- CORS headers for same-origin requests
- Error handling (400, 402 payment required, 429 rate limit, etc.)

---

### SEO & HTML

#### [MODIFY] [index.html](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/index.html)

- Title: `Free Image Background Remover - Remove Background from Photo Online`
- Meta description targeting "image background remover" keyword
- Google Fonts preconnect links
- Open Graph / Twitter meta tags
- Favicon

---

### Configuration

#### [NEW] [.dev.vars](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/.dev.vars)

Local development environment file for Cloudflare Pages:
```
REMOVE_BG_API_KEY=your_api_key_here
```

#### [MODIFY] [vite.config.js](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/vite.config.js)

Add proxy config for local dev to forward `/api/*` requests to the Cloudflare Pages Function dev server.

#### [MODIFY] [.gitignore](file:///Users/wanglingwei/Documents/Antigravity/websites/bg-remover/.gitignore)

Add `.dev.vars` to gitignore.

## Verification Plan

### Automated Tests

1. **Build check**: Run `npm run build` to verify the production build succeeds without errors
2. **Lint check**: Run `npm run lint` to verify no lint errors

### Browser Verification

1. Start dev server with `npm run dev`
2. Open the site in browser and verify:
   - All sections render correctly (Header, Hero, Features, How It Works, FAQ, Footer)
   - Drag-and-drop upload zone is interactive
   - Responsive layout works on mobile viewports
   - Animations and hover effects work smoothly
   - Before/After slider is draggable
3. Test the full flow (requires a valid Remove.bg API key in `.dev.vars`):
   - Upload an image → see processing animation → see result with before/after → download

### Manual Verification (User)

1. Set your Remove.bg API key in `.dev.vars`
2. Run `npx wrangler pages dev dist` to test the Cloudflare Pages Function locally
3. Deploy to Cloudflare Pages and verify production behavior
