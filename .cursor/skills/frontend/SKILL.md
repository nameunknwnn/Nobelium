---
name: frontend
description: Guide for building and editing the Nobelium frontend — a Next.js 16 App Router project with Tailwind v4, cookie-based auth, and a FastAPI backend. Use when creating pages, components, styles, API calls, or any frontend code in the frontend/ directory.
disable-model-invocation: true
---

# Nobelium Frontend

## Critical: Next.js 16

This project runs **Next.js 16.2.6** with breaking changes from earlier versions. Before writing any Next.js code, consult the docs at `node_modules/next/dist/docs/` and read `frontend/AGENTS.md`. Do not rely on training-data assumptions about Next.js APIs.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.6 (App Router, no `pages/` router) |
| React | 19.2.4 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 (CSS-first, no `tailwind.config.js`) |
| Fonts | Geist Sans + Geist Mono via `next/font/google` |
| API client | Native `fetch` with `credentials: "include"` |
| Auth | HTTP-only cookie (`token`) set by FastAPI backend |
| Env | `NEXT_PUBLIC_BACKEND_URL` — the only frontend env var |

**Not used** (do not add unless explicitly requested): Redux, Zustand, React Query, SWR, axios, shadcn/ui, CSS modules, Sass, `pages/` router.

## Directory Structure

```
frontend/
├── app/
│   ├── globals.css              # Tailwind import + CSS variables
│   ├── layout.tsx               # Root layout (fonts, metadata)
│   ├── page.tsx                 # Landing page (/)
│   ├── signin/page.tsx          # Login
│   ├── signup/page.tsx          # Registration
│   ├── user/
│   │   ├── page.tsx             # Dashboard
│   │   └── [slug]/page.tsx      # Agent thread detail
│   └── components/
│       ├── common/              # Shared UI (nav, footer)
│       └── landing/             # Landing-page sections
├── public/                      # Static assets
├── postcss.config.mjs           # Tailwind v4 PostCSS plugin
└── tsconfig.json                # @/* path alias available
```

No `lib/`, `hooks/`, `contexts/`, `utils/`, `types/`, or `services/` directories exist yet. All logic lives in page files.

## Route Map

| Route | File | Rendering | Purpose |
|-------|------|-----------|---------|
| `/` | `app/page.tsx` | Server | Landing: nav, hero, catalog, footer |
| `/signin` | `app/signin/page.tsx` | Client | POST `/signin` → cookie → `/user` |
| `/signup` | `app/signup/page.tsx` | Client | POST `/signup` → `/signin` |
| `/user` | `app/user/page.tsx` | Client | Auth-gated dashboard, agent list, prompt input |
| `/user/[slug]` | `app/user/[slug]/page.tsx` | Client | Agent thread: metadata sidebar + chat |

## Conventions

### File naming
- **camelCase** for component files: `heroSection.tsx`, `agentCatalog.tsx`
- Match existing style — do not switch to PascalCase

### Components
- Use **named default exports**: `export default function ComponentName() {}`
- Place shared components in `app/components/common/` or `app/components/landing/`
- Feature-specific UI stays inline in `page.tsx`

### Client vs Server components
- Add `"use client"` only when the component uses hooks, event handlers, `fetch` in effects, or browser APIs
- Server components for static/marketing content

### Types
- Define interfaces inline in the file that uses them
- No shared `types/` directory exists

## Styling

### Tailwind v4 CSS-first config

Extend themes in `app/globals.css` using `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

No `tailwind.config.js` — all config lives in CSS.

### Two visual systems

**Landing pages** — light cream aesthetic:
- Background: `#f5f0e6`
- Accents: `#5c8a5c` (green), serif headings
- Footer: `#1a1714` dark

**Dashboard/app pages** — dark theme:
- Background: `bg-[#0e0e10]`
- Text: white with opacity variants (`text-white/40`, `text-white/60`)
- Borders: `border-white/10`
- Cards: `bg-white/[0.04]` glassmorphism
- Primary CTA: `bg-white text-black rounded-lg`

### Common patterns
- Tailwind arbitrary values for opacity: `bg-white/[0.04]`
- Inline Tailwind only — no CSS modules, styled-components, or Sass

## API Integration

### Base URL
```typescript
`${process.env.NEXT_PUBLIC_BACKEND_URL}/<endpoint>`
```

### Fetch pattern
```typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/endpoint`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ key: value }),
});
const data = await res.json();
```

Always include `credentials: "include"` for authenticated requests.

### Auth flow
1. Protected pages call `GET /me` with `credentials: "include"` in a `useEffect`
2. Non-200 response → `router.push("/signin")`
3. Google OAuth: redirect to `${BACKEND_URL}/google/oauth` (full page redirect)

### Backend endpoints used by frontend

| Method | Endpoint | Auth | Request | Response |
|--------|----------|------|---------|----------|
| POST | `/signin` | No | `{ email, password }` | `{ message, token }` + Set-Cookie |
| POST | `/signup` | No | `{ email, password }` | `{ message }` |
| GET | `/me` | Cookie | — | `{ email }` or 401 |
| GET | `/all-agents` | Cookie | — | `{ message, agents[] }` |
| POST | `/agent` | Cookie | `{ prompt, thread_id? }` | `{ message, thread_id, response }` |
| GET | `/agent/{thread_id}` | Cookie | — | `{ message, thread_id, agent }` |
| GET | `/google/oauth` | — | — | OAuth redirect |

### Agent type shape
```typescript
interface Agent {
  id: string;
  title: string;
  watcheTool: string;   // note: backend spells it "watcheTool"
  updateTool: string;
  steps: { step: number; text: string }[];
}
```

## Known Gaps

These are intentional simplifications in the current codebase — not bugs to fix unless asked:

- No shared `useAuth` hook — auth check is duplicated per page
- No centralized API layer — fetch calls are inline
- No error UI — most `catch` blocks are empty
- No `next/image` or `next/link` — uses `<img>` and `router.push`
- No tests, no Prettier, no Storybook
- `@/*` path alias is configured but unused (all imports are relative)
- Missing static assets referenced in code: `hero-v3.webp`, `footer-bg.webp`, `globe.svg`

## Checklist for New Pages

1. Create `app/<route>/page.tsx`
2. Add `"use client"` if interactive
3. If auth-gated: add `/me` check in `useEffect`, redirect on failure
4. Use the matching visual system (landing = light, app = dark)
5. Use native `fetch` with `credentials: "include"` for API calls
6. Match existing file/component naming conventions
