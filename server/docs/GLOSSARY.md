<!-- FRESH:FILE  Plain-English backend glossary for the FRESH team. -->
<!-- FRESH:AREA  API -->

# Glossary

- **Express route** — A URL and HTTP method handler. Example: `POST /api/donations` creates food.
- **Middleware** — Code that runs before a route. Example: authentication checks a JWT before the controller.
- **Controller** — The small HTTP-facing function that reads a request and returns a response.
- **Service** — Reusable business logic outside HTTP. Example: calculating nearby partners.
- **Serializer** — Converts database rows to the frontend’s existing field names.
- **ORM / Drizzle** — A library that lets JavaScript query tables safely instead of writing every SQL string.
- **Schema** — The code description of tables, columns, and relationships.
- **Migration** — A committed SQL change that upgrades a database to the next schema version.
- **Enum** — A column limited to named values. Example: donation status `available` or `accepted`.
- **Index** — A database lookup structure that makes common searches faster.
- **PostGIS / geometry** — PostgreSQL map support. Example: a point stores longitude and latitude.
- **Transaction** — Several database changes committed together or rolled back together.
- **Atomic update** — One database operation that prevents two users from accepting the same donation.
- **JWT** — A signed login token sent with API requests.
- **Cookie session** — A server-managed login session stored in a browser cookie; FRESH uses bearer JWTs for the API.
- **Socket** — A persistent connection for live events such as status changes.
- **Cron job** — A scheduled server task. Example: expire old donations every minute.
- **Rate limit** — A request cap that slows abuse. Example: 120 API calls per minute.
- **Environment variable** — Configuration provided outside code. Example: `DATABASE_URL`.
- **Seed data** — Fictional starting records used for development, never real users.
- **Test** — An automated check of expected behavior.
- **Mock vs real data** — Mock data is local fictional data; real data is stored in PostgreSQL.
