.PHONY: help up down logs migrate studio seed clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start containers
	docker compose up -d

down: ## Stop containers
	docker compose down

logs: ## Show logs
	docker compose logs -f

migrate: ## Run Prisma migrations
	pnpm prisma migrate dev

studio: ## Open Prisma Studio
	pnpm prisma studio

seed: ## Run database seed
	pnpm prisma db seed

generate: ## Generate Prisma client
	pnpm prisma generate

clean: ## Remove containers and volumes
	docker compose down -v

lint: ## Run Biome lint
	pnpm biome check .

lint-fix: ## Fix lint issues
	pnpm biome check --write .

format: ## Format code
	pnpm biome format --write .
