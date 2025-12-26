# Storagie API

High-performance backend service for the Storagie platform, engineered with NestJS and Fastify. This system adheres to Domain-Driven Design (DDD) principles and utilizes a robust event-driven architecture to ensure scalability and maintainability.

## Key Features

- **Global Authentication System**: Implements secure, passwordless magic link authentication using JWT (Access and Refresh tokens) with automatic cookie management. Security is enforced globally via guards, with explicit opt-in for public endpoints.
- **Modular Architecture**: Implementation of Clean Architecture with strict separation of concerns across Domain, Application, and Infrastructure layers.
- **Advanced Data Management**: PostgreSQL integration via Prisma ORM, featuring custom extensions for comprehensive Soft Delete and Restore capabilities.
- **Asynchronous Processing**: Integrated BullMQ configuration for handling background jobs and reliable email delivery.
- **High Performance**: Built on Fastify for high-throughput HTTP handling, complemented by Redis caching strategies.
- **Observability**: Centralized, structured logging system using Pino for detailed operational insights.

## Technology Stack

The application is built on a modern, type-safe stack:

- **Runtime**: Node.js 20+
- **Framework**: NestJS 11 (Fastify adapter)
- **Database**: PostgreSQL 16 with Prisma 6
- **Cache**: Redis (IORedis)
- **Queue System**: BullMQ
- **Logging**: Pino

## Getting Started

### Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (for infrastructure)
- pnpm package manager

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start required infrastructure (PostgreSQL, Redis):
   ```bash
   docker compose up -d
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your specific configuration
   ```

4. Initialize the database:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3000` (or the port defined in `PORT` env var).

## Project Structure

The codebase follows a modular structure to isolate features and infrastructure:

```
src/
├── config/           # Centralized configuration with validation
├── modules/          # Feature using Domain-Driven Design
│   └── auth/         # Authentication and Session management
│   └── user/         # User domain and profile management
└── shared/
    ├── constants/    # Dependency Injection tokens and system constants
    └── infrastructure/
        ├── database/ # Prisma configuration and extensions
        ├── cache/    # Cache abstraction (Redis/Memory)
        ├── queue/    # Async job processing
        ├── logging/  # System-wide logging
        └── email/    # Email delivery providers
```

## Documentation

Detailed architectural and operational documentation is available in the `/docs` directory:

| Topic | Description |
|-------|-------------|
| [Architecture](./docs/architecture.md) | high-level design patterns and principles |
| [Authentication](./docs/auth.md) | Security flows, tokens, and guards |
| [Database](./docs/database.md) | Schema design and ORM usage |
| [Configuration](./docs/config.md) | Environment setup and validation |
| [Queue System](./docs/queue.md) | Background job processing |
| [Logging](./docs/logging.md) | Log aggregation and standards |

## Development

### Available Scripts

- `pnpm dev`: Start development server with hot reload
- `pnpm build`: Compile project for production
- `pnpm prod`: Start production server
- `pnpm lint`: Run static analysis (Biome)
- `pnpm format`: Format codebase (Biome)
- `pnpm db:migrate`: Apply database migrations

### Coding Standards

Please refer to the [.agents/rules/](./agents/rules/) directory for comprehensive coding guidelines, naming conventions, and architectural rules enforced in this project.

## License

Private Repository. All rights reserved.
