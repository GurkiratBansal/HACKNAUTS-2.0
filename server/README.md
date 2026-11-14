# FRESH backend

Express 4 + Drizzle ORM + PostgreSQL/PostGIS backend for FRESH.

## Local development

1. Copy `.env.example` to `.env` and set a random `JWT_SECRET`.
2. Start PostgreSQL/PostGIS: `docker compose up -d`.
3. Install dependencies: `npm install`.
4. Generate/migrate schema: `npm run db:generate` then `npm run db:migrate`.
5. Start API: `npm run dev`.

`TEST_DATABASE_URL` must point to a real PostGIS test database for integration tests. No database or credentials are bundled in this repository.
