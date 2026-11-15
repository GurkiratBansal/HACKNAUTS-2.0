<!-- FRESH:FILE  Backend folder and responsibility map. -->
<!-- FRESH:AREA  API -->

# FRESH backend code map

| Folder/file | Area | Responsibility |
|---|---|---|
| `src/config/` | CONFIG | Validated environment and constants. |
| `src/db/schema/` | DB | Drizzle/PostGIS tables and enums. |
| `src/db/client.js` | DB | PostgreSQL pool and Drizzle client. |
| `src/routes/` | API | HTTP route definitions and validation entry points. |
| `src/middleware/` | API | Authentication, errors, and request guards. |
| `src/serializers/` | API | Converts database rows to frontend-compatible shapes. |
| `src/services/` | API | Business rules and external service access. |
| `src/jobs/` | JOBS | Scheduled expiry/escalation work. |
| `src/sockets/` | SOCKET | Realtime status events. |
| `src/seed/` | SEED | Fictional sample records only. |
| `src/app.js` | API | Express security middleware and route mounting. |
| `src/server.js` | API | Starts the HTTP server. |
| `drizzle/` | DB | Generated SQL migrations; do not hand-edit. |

## Common changes

| If you want to… | Look in… |
|---|---|
| Change urgency rules | `src/services/urgency.js`, then its tests. |
| Add a donation field | `src/db/schema/donations.js`, donation validation, and `src/serializers/index.js`. |
| Change who can accept | `src/routes/donations.js` and `src/middleware/auth.js`. |
| Change emergency behavior | `src/routes/emergency.js`, `src/services/emergency.js`, and `src/jobs/expireEmergency.js`. |
| Change the radius limit | `src/services/nearby.js` and `src/config/constants.js`. |
| Change public/private location rules | `src/services/privacy.js` and donation serializers. |
| Add a needs-board item | `src/db/schema/needs.js`, `src/routes/needs.js`, and the needs serializer. |
| Change stats | `src/routes/stats.js` and `src/services/impact.js`. |
| Change authentication | `src/routes/auth.js`, `src/middleware/auth.js`, and `src/services/auth.js`. |
| Change scheduled expiry | `src/jobs/` and `src/server.js` job startup. |
