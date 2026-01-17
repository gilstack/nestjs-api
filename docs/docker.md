# Docker Development Environment

## Overview

The project includes a complete Docker development environment with hot-reload support.

## Services

| Service    | Container Name      | Port       | Description        |
| ---------- | ------------------- | ---------- | ------------------ |
| API        | `storagie_api`      | 8000       | NestJS application |
| PostgreSQL | `storagie_postgres` | 5432       | Primary database   |
| Redis      | `storagie_redis`    | 6379       | Cache and queue    |
| MailHog    | `storagie_mailhog`  | 1025, 8025 | Email testing UI   |

## Quick Start

### Full Docker Environment

Start all services including the API:

```bash
# Build and start all containers
docker compose up -d --build

# View API logs
docker compose logs -f api
```

### Hybrid Mode (Recommended for Development)

Run infrastructure in Docker, API locally for faster reloads:

```bash
# Start only Postgres, Redis, Mailhog
docker compose up -d postgres redis mailhog

# Run API locally
pnpm dev
```

## Files

| File                 | Description                            |
| -------------------- | -------------------------------------- |
| `Dockerfile.dev`     | Development Dockerfile with hot-reload |
| `docker-compose.yml` | Service orchestration                  |
| `.env.example`       | Environment template (used by Docker)  |
| `.dockerignore`      | Build context exclusions               |

## Environment Configuration

Docker uses `.env.example` directly with service hostnames:

- Database: `postgres:5432` (not `localhost`)
- Redis: `redis:6379`
- SMTP: `mailhog:1025`

For local development, copy and modify:

```bash
cp .env.example .env
# Edit .env: change postgres/redis/mailhog → localhost
```

## Commands

### Docker Compose

```bash
# Start all services
docker compose up -d

# Start with rebuild
docker compose up -d --build

# Stop all services
docker compose down

# View logs
docker compose logs -f api

# Shell into API container
docker compose exec api sh

# Run migrations manually
docker compose exec api pnpm db:migrate
```

### Makefile (if installed)

```bash
make dev          # Start full environment
make dev-build    # Rebuild and start
make dev-logs     # View API logs
make dev-restart  # Restart API
make dev-shell    # Shell into container
make up           # Start infrastructure only
make down         # Stop all
make clean        # Remove volumes
```

## Automatic Migrations

The Dockerfile is configured to run migrations automatically on container startup:

```dockerfile
CMD ["sh", "-c", "pnpm db:migrate && pnpm dev"]
```

This ensures the database schema is always up-to-date when starting the environment.

## Hot Reload

Source code is mounted as volumes for instant reloads:

```yaml
volumes:
  - ./src:/app/src:delegated
  - ./prisma:/app/prisma:delegated
```

Changes to files in `src/` and `prisma/` are reflected immediately.

## Troubleshooting

### Container won't start

Check if ports are in use:

```bash
lsof -i :8000
lsof -i :5432
lsof -i :6379
```

### Database connection issues

Ensure containers are healthy:

```bash
docker compose ps
```

Wait for `healthy` status on `postgres` and `redis`.

### Fresh start

Remove all containers and volumes:

```bash
docker compose down -v
docker compose up -d --build
```
