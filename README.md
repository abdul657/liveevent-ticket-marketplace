# LiveEvent — AI-Powered Ticket Discovery Marketplace

LiveEvent is a full-stack portfolio project exploring the consumer journey for live events: discover an event, compare ticket offers, and decide what to attend. The first milestone delivers a responsive discovery experience and typed API backed by PostgreSQL.

> **Current scope:** event discovery, search and filtering, event details, and sample ticket listings. Checkout, payments, seller workflows, recommendations, and LLM-powered discovery are planned milestones—not implemented features yet.

## Stack
- **Web:** React, TypeScript, Vite
- **API:** Node.js, Express, TypeScript, Zod
- **Data:** PostgreSQL with parameterized queries and indexes
- **Quality:** Vitest, TypeScript strict mode, GitHub Actions
- **Local environment:** Docker Compose

## Current features
- Search upcoming events by title, artist, venue, and city
- Filter by category and city; sort by date or ticket price
- Browse responsive event cards with starting prices and available-ticket counts
- Open event details and compare sample ticket offers by section, row, and price
- Validate API query parameters and use parameterized SQL
- Run the web app, API, and PostgreSQL locally with Docker Compose

## Architecture
```text
React + TypeScript (Vite)
        | /api
        v
Express + TypeScript API
        |
        v
PostgreSQL (events, ticket_listings)
```

## Run locally with Docker
Requirements: Docker Desktop / Docker Engine with Compose.

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:5173. API health: http://localhost:4000/api/health.

The database schema and seed records load automatically on first initialization. To reset the local database:

```bash
docker compose down -v
docker compose up --build
```

## Run without Docker
Requirements: Node.js 20+, npm, and PostgreSQL 16+.

1. Create a database and apply `database/schema.sql`, then `database/seed.sql`.
2. Copy `.env.example` to `.env` and set `DATABASE_URL`.
3. Run:

```bash
npm install
npm run dev
```

Vite runs at http://localhost:5173 and proxies `/api` to port 4000.

## API
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | API process health |
| GET | `/api/categories` | Available categories |
| GET | `/api/events` | Search, filter, sort, and paginate |
| GET | `/api/events/:slug` | Event details and ticket offers |

Example: `curl "http://localhost:4000/api/events?q=jazz&city=New%20York&sort=price_low&page=1&limit=12"`

Query parameters: `q`, `category`, `city`, `sort` (`date`, `price_low`, `price_high`), `page`, and `limit` (1–50).

## Quality checks
```bash
npm install
npm run typecheck
npm test
npm run build
```

## Roadmap
- [ ] Accounts, saved events, and browsing preferences
- [ ] Personalized ranking using the existing recommendation-engine project
- [ ] Transactional ticket reservations with expiry and concurrency tests
- [ ] Cart and simulated checkout (no real payment processing)
- [ ] LLM-powered natural-language discovery using structured tools
- [ ] Browser end-to-end tests and deployment

## Data and limitations
Events and ticket offers are fictional seed data for local development. This project does not connect to StubHub or any ticket provider, does not sell real tickets, and does not process payments. Prices and availability are illustrative.

## License
MIT
