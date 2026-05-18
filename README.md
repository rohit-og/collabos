# CollabOS

Open-source collaborative workspace platform for teams and developers.

## Project Goal

Build a production-grade, open-source collaborative workspace platform where teams can:

- collaborate in real time
- manage projects and tasks
- create shared notes and docs
- chat instantly
- work inside shared workspaces

This repository follows the development plan in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).

## Monorepo Structure

- apps/
  - api/ — NestJS backend (Prisma, PostgreSQL, Redis, JWT auth)
  - web/ — Next.js frontend
- packages/ — shared libraries (ui, shared, config)
- docker/ — Dockerfiles and docker-compose for local dev
- docs/ — architecture and design docs

## Tech Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Zustand, TanStack Query, TipTap, Socket.IO client
- Backend: NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis, Socket.IO, BullMQ, JWT + Refresh Tokens
- Infrastructure: Docker, Docker Compose, Nginx, GitHub Actions

## Getting Started (local)

Prerequisites:
- Node.js >= 20
- pnpm (repo uses pnpm workspaces)
- PostgreSQL (or use the provided Docker Compose)

1. Install dependencies (root):

```bash
pnpm install -w
```

2. Configure environment

Copy environment files and set values for services (API example):

```bash
cp apps/api/.env.example apps/api/.env
# then edit apps/api/.env to set DATABASE_URL, JWT_SECRET, API_PORT, ENABLE_SWAGGER, etc.
```

3. Generate Prisma client (API):

```bash
cd apps/api
pnpm run db:generate
# To push schema to the database (local dev):
pnpm run db:push
# Or run migrations when ready:
# npx prisma migrate dev --name init
```

4. Start services (examples)

Start API (watch):

```bash
cd apps/api
pnpm run dev
```

Start web (Next dev):

```bash
cd apps/web
pnpm run dev
```

By default the API listens on the port in `API_PORT` (default 3001). API routes are prefixed with `/api` and Swagger UI is available at `/api/docs` when `ENABLE_SWAGGER=true`.

## Auth API (current)

The backend includes an `auth` module (MVP) providing:

- `POST /api/auth/register` — register a new user
- `POST /api/auth/login` — obtain `accessToken` and `refreshToken`
- `POST /api/auth/refresh` — exchange a refresh token for a new access token
- `POST /api/auth/logout` — revoke refresh token by token id

Swagger UI shows example request bodies for auth endpoints. JWTs are validated with a `JwtStrategy`. Refresh tokens are hashed and stored in the `refresh_tokens` table (see Prisma schema).

## Development Notes

- Prisma schema: `apps/api/prisma/schema.prisma`
- Prisma client is generated into the workspace `node_modules`; run `pnpm --filter @collabos/api run db:generate` or run from `apps/api`.
- Global app configuration is via `@nestjs/config` and `.env` files.
- Swagger is initialized in `apps/api/src/main.ts` and enabled by `ENABLE_SWAGGER=true`.

## Testing

- Unit/integration tests live under `apps/api/test` and `apps/web/test` where applicable.
- Run tests from each package, e.g.:

```bash
cd apps/api
pnpm test
```

## Roadmap & Development Plan

Follow the full roadmap and phased plan in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md). High-level phases include:

- Foundation: monorepo, Next.js, NestJS, Docker, Prisma, CI
- Authentication: JWT, refresh tokens, RBAC (current phase)
- Workspace system: multi-tenant workspaces, invites, roles
- Realtime chat and collaborative editor (Yjs/TipTap)
- Kanban tasks, notifications, presence
- DevOps and production deployment

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) (create one if missing). Suggested workflow:

- Fork and create a feature branch
- Run tests and linters locally
- Open a PR with description and tests

## Security

- Keep `JWT_SECRET` and database credentials out of source control.
- Revoke or rotate refresh tokens on suspicious activity.

## Contact

For questions, open an issue or contact the maintainers via the repository.
