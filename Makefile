.PHONY: help up down logs migrate studio seed clean dev dev-build dev-logs dev-restart dev-shell

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Docker Compose - Infrastructure Only
up: ## Start infrastructure containers (postgres, redis, mailhog)
	docker compose up -d postgres redis mailhog

down: ## Stop all containers
	docker compose down

logs: ## Show all container logs
	docker compose logs -f

clean: ## Remove containers and volumes
	docker compose down -v

# Docker Compose - Full Development
dev: ## Start full development environment with API
	docker compose up -d
	docker compose logs -f api

dev-build: ## Rebuild and start development environment
	docker compose up -d --build
	docker compose logs -f api

dev-logs: ## Show API logs only
	docker compose logs -f api

dev-restart: ## Restart API container
	docker compose restart api
	docker compose logs -f api

dev-shell: ## Open shell in API container
	docker compose exec api sh

# Database Commands
migrate: ## Run Prisma migrations
	pnpm prisma migrate dev

studio: ## Open Prisma Studio
	pnpm prisma studio

seed: ## Run database seed
	pnpm prisma db seed

generate: ## Generate Prisma client
	pnpm prisma generate

# Code Quality
lint: ## Run Biome lint
	pnpm biome check .

lint-fix: ## Fix lint issues
	pnpm biome check --write .

format: ## Format code
	pnpm biome format --write .

