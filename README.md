# Storagie API

Backend API for the Storagie application built with NestJS.

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 |
| HTTP | Fastify |
| Database | PostgreSQL + Prisma 6 |
| Cache | Redis |
| Queue | BullMQ |
| Logging | Pino |

## Quick Start

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker compose up -d

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Start development server
pnpm dev
```

The API will be available at `http://localhost:3000`.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build for production |
| `pnpm prod` | Run production build |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
src/
├── config/           # Configuration system
├── modules/          # Feature modules
└── shared/
    ├── constants/    # DI tokens
    └── infrastructure/
        ├── database/ # Prisma
        ├── cache/    # Redis/Memory
        ├── queue/    # BullMQ
        └── logging/  # Pino
```

## Documentation

Detailed documentation is available in the `/docs` directory:

- [Architecture Overview](./docs/architecture.md)
- [Configuration System](./docs/config.md)
- [Database Layer](./docs/database.md)
- [Cache Layer](./docs/cache.md)
- [Queue Layer](./docs/queue.md)
- [Logging System](./docs/logging.md)

## Development Guidelines

See [.agents/rules/](./agents/rules/) for coding standards and patterns.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string

## License

UNLICENSED - Private repository
