---
id: platforms
title: Platforms
sidebar_position: 4
---

# Platforms

Shipd scores 11 hosting platforms against detected repository signals.

## Scoring model

Each platform rule produces:

- **Score** (0–100) — overall fit
- **Verdict** — Excellent fit / Good fit / Can work / Limited fit / Not recommended
- **Reasons** — why this platform fits this repo
- **Evidence** — signals that support the score
- **Disqualifiers** — reasons it doesn't fit

Platforms are ranked by score. The top platform (score ≥ 30) is featured as the recommendation. If no platform scores ≥ 30, Shipd shows a no-fit state and uses the README to guide the chat.

## Platform coverage

### Railway

Best for: Next.js apps with databases, Node.js services, Python services, full-stack apps.

Strong signals: `railway.toml`, Dockerfile, `DATABASE_URL` env var (especially with Next.js), Express/FastAPI/Django, monorepo with multiple services.

:::tip
Railway is a strong alternative to Vercel when your app needs a co-located database. One project holds both the app and Postgres with `DATABASE_URL` auto-wired.
:::

### Fly.io

Best for: containerised services, global edge deployment, latency-sensitive workloads.

Strong signals: `fly.toml`, Dockerfile, multi-region requirements, non-Node runtimes (Go, Rust, Ruby).

### Vercel

Best for: Next.js apps, SvelteKit, Nuxt, Remix, Astro, static sites.

Strong signals: `next` in dependencies, `vercel.json`, no custom server, standard Next.js build.

:::caution
Vercel scores near-zero for multi-service .NET solutions, CLI tools, and non-web repos. Apps with `DATABASE_URL` work on Vercel but require a separate managed database (Neon, Supabase, Prisma Postgres).
:::

### Render

Best for: Docker-first services, background workers, static sites with a backend.

Strong signals: `render.yaml`, Dockerfile, Python services, Ruby on Rails.

### Azure Container Apps

Best for: .NET solutions, containerised enterprise apps, multi-service architectures.

Strong signals: `.sln` file, multiple `.csproj` files, `.bicep` or `azure.yaml`, .NET Aspire (`*.AppHost.csproj`).

### AWS App Runner

Best for: containerised Node.js and Python services, AWS-native workloads.

Strong signals: `apprunner.yaml`, Dockerfile, AWS SDK env vars (`AWS_*`).

### GCP Cloud Run

Best for: containerised services, event-driven workloads, GCP-native stacks.

Strong signals: `app.yaml`, Dockerfile, GCP SDK env vars (`GOOGLE_*`, `GCP_*`).

### Heroku

Best for: Rails apps, Python services, Node.js apps with simple deploys.

Strong signals: `Procfile`, `Gemfile`, Heroku-style `DATABASE_URL`.

### DigitalOcean App Platform

Best for: Node.js, Python, Go services. Simple container deploys.

Strong signals: `.do/app.yaml`, Dockerfile, straightforward runtimes.

### Netlify

Best for: static sites, JAMstack frontends, serverless functions without persistent state.

Strong signals: `netlify.toml`, static output (`next export`, Astro static), no server runtime, no database.

:::caution
Apps with `DATABASE_URL` score lower on Netlify — persistent database connections need a connection pooler (e.g. Prisma Accelerate, PgBouncer) to work reliably in Netlify's serverless model.
:::

### Docker + VPS

Best for: full control, self-hosted, complex multi-container setups.

Strong signals: `docker-compose.yml`, Dockerfile, infrastructure code, multi-service requirements.

## Hard caps

These repo classes are **capped at 0** on all web platforms — they are not deployable web services:

| Class | Cap | Reason |
|---|---|---|
| `cli_tool` | 0 | Distributed as binary, not deployed |
| `notebook_repo` | 18 | No deployable entrypoint |
| `infra_only` | 18 | No application code |
| `library_or_package` | 18 | Not a web service |

## ORM migration steps

When Shipd detects an ORM, the deployment plan includes the exact migration command for that stack:

| ORM | Migration command |
|---|---|
| Prisma | `npx prisma migrate deploy` |
| Drizzle | `npx drizzle-kit migrate` |
| Django | `python manage.py migrate` |
| SQLAlchemy | `alembic upgrade head` |
| ActiveRecord (Rails) | `bundle exec rails db:migrate` |
| EF Core (.NET) | `dotnet ef database update` |
| Hibernate (Java) | Apply via Flyway or Liquibase |
| GORM (Go) | `db.AutoMigrate()` or Goose |
| Eloquent (Laravel) | `php artisan migrate --force` |
| TypeORM | `migrationsRun: true` in DataSource config |
