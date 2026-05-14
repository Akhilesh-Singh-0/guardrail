<div align="center">

<svg width="56" height="56" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M16 2L30 9V18C30 24.627 23.732 29.74 16 31C8.268 29.74 2 24.627 2 18V9L16 2Z" stroke="#6366f1" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M10 16.5L14 20.5L22 12.5" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<h1>Guardrail — Web</h1>

<p>AI spend monitoring dashboard — built from scratch</p>

<p><em>A Next.js 15 frontend for real-time AI cost visibility — spend meters, usage analytics, a prompt playground, and live alerts, all pushed via WebSocket.</em></p>

<p>
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white" alt="Clerk"/>
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query"/>
  <img src="https://img.shields.io/badge/Framer_Motion-EE4B93?style=flat-square&logo=framer&logoColor=white" alt="Framer Motion"/>
</p>

<p>
  <a href="https://guardrail-web-mu.vercel.app"><strong>Live Demo</strong></a> ·
  <a href="../api/README.md"><strong>Backend README</strong></a> ·
  <a href="https://twitter.com/singh_akhil2272"><strong>Building in Public</strong></a>
</p>

</div>

---

## What This Does

This is the dashboard half of Guardrail. It connects to the API over REST and WebSocket, shows per-user spend in real time, and lets you fire prompts through the proxy and watch the meter tick up live — no polling, no refresh.

Every data update — usage events, limit changes, alert triggers — arrives over a single WebSocket connection and invalidates the relevant TanStack Query caches immediately.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Clerk |
| Server State | TanStack Query v5 |
| HTTP Client | Axios |
| Real-time | Native WebSocket API |
| Animation | Framer Motion |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          ← Sidebar nav wrapper
│   │   ├── dashboard/page.tsx  ← Spend meters, stats, request feed
│   │   ├── playground/page.tsx ← AI prompt interface with live billing
│   │   └── settings/page.tsx   ← Limits + alerts management
│   ├── layout.tsx              ← ClerkProvider + QueryClient + fonts
│   ├── page.tsx                ← Landing page
│   └── globals.css             ← Design tokens + Tailwind v4
├── components/
│   ├── logo.tsx                ← Logo with size variants
│   ├── nav.tsx                 ← Sidebar navigation
│   └── providers.tsx           ← QueryClientProvider + AuthSync + Toaster
├── hooks/
│   ├── use-summary.ts          ← GET /usage/summary
│   ├── use-limits.ts           ← GET /limits
│   ├── use-events.ts           ← GET /usage/events
│   └── use-websocket.ts        ← WebSocket with exponential backoff reconnect
├── lib/
│   ├── api.ts                  ← Axios instance
│   ├── models.ts               ← Model registry with provider + pricing metadata
│   ├── queryClient.ts          ← TanStack Query config
│   ├── clerk-appearance.ts     ← Dark theme Clerk config
│   └── utils.ts                ← cn utility
└── middleware.ts               ← Clerk route protection
```

---

## Features

### Dashboard
- Daily and monthly spend meters with animated progress bars
- Live request feed — every completed prompt appears instantly
- Per-model spend breakdown
- Hourly spend chart
- Alert banners when thresholds are crossed — no page refresh needed

### Playground
- Send prompts directly through the Guardrail proxy
- Model selector with pricing metadata shown inline
- Spend meter updates in real time as each request completes
- 402 response handled gracefully — shows limit reached state

### Settings
- Update daily and monthly spending limits
- Create, view, and resolve alerts
- Delete alerts

### Real-time (WebSocket)
- Single persistent connection per session, auth'd via Clerk JWT on connect
- `USAGE_UPDATE` → invalidates `summary`, `limits`, `events` queries
- `ALERT_TRIGGERED` → invalidates `alerts` query
- Exponential backoff reconnection: 1s → 2s → 4s → max 30s
- Stops reconnecting on auth failure (code 1008) or after 5 failed attempts

---

## Architecture Decisions

- **Token fetched per query, not globally set** — a globally set Axios token has a race condition where queries fire before the token is available. Every `queryFn` fetches the token fresh via `getToken()` before the request.
- **Cache invalidation on WebSocket events** — rather than maintaining separate local state, incoming events invalidate the relevant TanStack Query keys and let the cache refetch. Single source of truth.
- **Native WebSocket over a library** — simpler, no extra dependency, full control over reconnect logic.
- **Exponential backoff with auth-aware stop** — the WebSocket won't retry forever. Auth failures (1008) stop reconnection immediately; other failures back off and cap at 5 attempts.

---

## API Hook Pattern

All hooks follow the same pattern — token fetched inside `queryFn` on every call:

```ts
export const useHookName = () => {
  const { isSignedIn, getToken } = useAuth()

  return useQuery({
    queryKey: ['key'],
    enabled: !!isSignedIn,
    queryFn: async () => {
      const token = await getToken()
      const { data } = await api.get('/endpoint', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return data
    }
  })
}
```

Never rely on a globally set token — it has a race condition where queries fire before the token is set.

---

## Design System

Dark theme with an indigo primary accent throughout.

- **Primary accent:** Indigo (`#6366f1`) — CTAs, active nav states, spend bar fill, charts
- **Background:** Near-black (`oklch(0.08 0 0)`)
- **Surface scale:** Three levels — page → card → elevated card
- **Typography:** Geist Sans for UI, Geist Mono for all numbers and cost values
- **Motion:** Framer Motion — subtle entry animations on cards, spend bar fill transitions

---

## Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running Locally

```bash
# Backend must be running first
# See apps/api/README.md

cd apps/web
npm install
npm run dev
```

Dashboard runs at `http://localhost:3000`

---

## Known Limitations

- Clerk webhooks require a publicly accessible URL in development. Use [ngrok](https://ngrok.com) to expose the backend and register the endpoint in the Clerk dashboard.
- New users must sign up through the app first — the Clerk webhook syncs them to Postgres, which is required before the dashboard loads their data.

---

## License

MIT — use it, fork it, learn from it.

---

<div align="center">
  <sub>If this was useful or interesting — a ⭐ goes a long way.</sub>
</div>