<div align="center">

# Guardrail

### Control, track, and enforce AI API spending — before it gets out of hand.

![Status](https://img.shields.io/badge/status-building%20in%20public-1D9E75?style=flat-square)
![Stack](https://img.shields.io/badge/stack-Node.js%20%7C%20TypeScript%20%7C%20PostgreSQL-3C3489?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

## The Problem

AI apps don't fail with crashes — they fail with **unexpected costs**.

One bug, one loop, or one power user:
→ usage spikes
→ costs explode
→ no visibility into *who* or *why*

Most systems only find out **after the bill arrives**.

---

## What Guardrail Does

Guardrail sits between your app and OpenAI and enforces cost control in real time:

- Tracks token usage and cost per request (per user, per model)
- Enforces daily and monthly spending limits
- Blocks requests **before** they hit OpenAI
- Streams live usage via WebSockets
- Detects anomalies against a rolling baseline
- Triggers alerts at 80% and 100% thresholds

---

## Why It Exists

Guardrail turns cost from:
- unpredictable → predictable
- invisible → observable
- reactive → enforceable

---

## Monorepo Structure

```
guardrail/
├── apps/
│   ├── api/          ← Node.js + Express backend
│   └── web/          ← Next.js dashboard (coming soon)
├── docker-compose.yml
└── turbo.json
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼────────────────────────────────┐
│                    API Server                           │
│                                                         │
│  Proxy Layer        → intercepts every OpenAI call      │
│  Billing Layer      → atomic Redis counters + limits    │
│  Queue Layer        → BullMQ async usage processing     │
│  Analytics Layer    → per-user spend queries            │
└──────────┬──────────────────────┬───────────────────────┘
           │                      │
┌──────────▼──────┐    ┌──────────▼──────────────────────┐
│   PostgreSQL    │    │         Redis                   │
│                 │    │                                 │
│  Users          │    │  Atomic spend counters          │
│  UsageEvents    │    │  Pub/Sub (real-time events)     │
│  UserLimits     │    │  BullMQ queues                  │
│  Alerts         │    │  Idempotency keys               │
└─────────────────┘    └─────────────────────────────────┘
        ▲
        │ JWT verification
┌───────┴─────────┐
│      Clerk      │
│   (Auth + User  │
│    webhook)     │
└─────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Clerk |
| Cache / Counters | Redis |
| Job Queue | BullMQ |
| Real-time | WebSockets |
| Monorepo | Turborepo |
| Infra | Docker |
| Validation | Zod |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker
- Clerk account (free tier works)

### Setup

```bash
git clone https://github.com/Akhilesh-Singh-0/guardrail.git
cd guardrail
npm install
cp apps/api/.env.example apps/api/.env
```

Update `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/guardrail
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=...
CLERK_PUBLISHABLE_KEY=...
CLERK_WEBHOOK_SECRET=...
OPENAI_API_KEY=sk-...
PORT=8000
NODE_ENV=development
```

Start services:

```bash
docker-compose up -d
cd apps/api
npm run dev
```

API: `http://localhost:8000`
Health: `http://localhost:8000/health`

---

## Status

Day 2 of 8 — building in public.

Follow: [@singh_akhil2272](https://twitter.com/singh_akhil2272)

---

## License

MIT

---

<div align="center">
  <sub>If you find this useful — a ⭐ helps a lot.</sub>
</div>