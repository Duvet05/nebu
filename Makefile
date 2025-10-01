# ==============================================
# NEBU MOBILE - MAKEFILE
# ==============================================

.PHONY: help start stop restart status logs health clean build dev prod backup

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m

# Variables
PROJECT_NAME := nebu-mobile
COMPOSE_FILE := docker-compose.yml
ENV_FILE := .env

## Help
help: ## Show this help message
	@echo "$(BLUE)Nebu Mobile - Container Management$(NC)"
	@echo "======================================"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(BLUE)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

## Development Commands
start: ## Start all services
	@echo "$(GREEN)Starting $(PROJECT_NAME) services...$(NC)"
	@./scripts/manage-containers.sh start

stop: ## Stop all services
	@echo "$(YELLOW)Stopping $(PROJECT_NAME) services...$(NC)"
	@./scripts/manage-containers.sh stop

restart: ## Restart all services
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services...$(NC)"
	@./scripts/manage-containers.sh restart

status: ## Show service status
	@./scripts/manage-containers.sh status

## Logging and Monitoring
logs: ## Show logs for all services
	@docker-compose logs -f

logs-service: ## Show logs for specific service (make logs-service SERVICE=backend)
	@docker-compose logs -f $(SERVICE)

health: ## Run health checks
	@./scripts/health-check.sh all

health-service: ## Check specific service health (make health-service SERVICE=backend)
	@./scripts/health-check.sh $(SERVICE)

## Build Commands
build: ## Build all Docker images
	@echo "$(GREEN)Building Docker images...$(NC)"
	@docker-compose build

build-no-cache: ## Build all Docker images without cache
	@echo "$(GREEN)Building Docker images (no cache)...$(NC)"
	@docker-compose build --no-cache

pull: ## Pull latest images
	@echo "$(GREEN)Pulling latest images...$(NC)"
	@docker-compose pull

## Environment Management
check-deps: ## Check if Docker and Docker Compose are installed
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)Docker is not installed!$(NC)"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "$(RED)Docker Compose is not installed!$(NC)"; exit 1; }
	@echo "$(GREEN)All dependencies are installed!$(NC)"

dev: check-deps ## Start development environment
	@echo "$(GREEN)Starting development environment...$(NC)"
	@cp template.env .env 2>/dev/null || true
	@docker-compose up -d

config: ## Generate Traefik config with interpolated variables
	@echo "$(BLUE)⚙️  Generating Traefik configuration...$(NC)"
	@docker-compose --profile config run --rm traefik-config
	@echo "$(GREEN) Configuration generated successfully$(NC)"

prod: check-deps config ## Start production environment with SSL config generation
	@echo "$(GREEN) Starting production environment...$(NC)"
	@echo "$(BLUE)⚙️  Generating SSL configuration...$(NC)"
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN) Production environment started!$(NC)"
	@echo ""
	@echo "$(BLUE) Available services:$(NC)"
	@echo "  API:      https://api.$(shell grep DOMAIN .env | cut -d= -f2 2>/dev/null || echo 'your-domain.com')"
	@echo "  Traefik:  https://traefik.$(shell grep DOMAIN .env | cut -d= -f2 2>/dev/null || echo 'your-domain.com')"
	@echo ""
	@echo "$(YELLOW)⚠️  SSL certificates will be generated automatically$(NC)"

prod-legacy: ## Start production environment without SSL config generation (legacy)
	@echo "$(YELLOW)⚠️  Starting production without SSL config generation...$(NC)"
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "$(GREEN)Production environment started!$(NC)"

## Database Commands
db-init: ## Initialize databases (automatic with TypeORM)
	@echo "$(GREEN)Database initialization is automatic with TypeORM synchronize=true$(NC)"
	@echo "$(YELLOW)No manual initialization needed for Nebu Mobile$(NC)"

db-migrate: ## Run database migrations
	@echo "$(GREEN)Running database migrations...$(NC)"
	@docker-compose exec backend npm run migration:run

db-seed: ## Seed database with initial data
	@echo "$(GREEN)Seeding database...$(NC)"
	@docker-compose exec backend npm run seed

db-reset: ## Reset database
	@echo "$(RED)Resetting database...$(NC)"
	@docker-compose exec backend npm run db:reset

db-backup: ## Backup database
	@echo "$(GREEN)Creating database backup...$(NC)"
	@docker-compose exec postgres pg_dump -U nebu_academy nebu_academy_db > backup_$(shell date +%Y%m%d_%H%M%S).sql


## Cleanup Commands
clean: ## Clean up Docker resources
	@./scripts/manage-containers.sh cleanup

clean-all: ## Complete stack cleanup (interactive)
	@echo "$(BLUE)Running complete stack cleanup...$(NC)"
	@./scripts/clean-stack.sh

clean-volumes: ## Remove all volumes (WARNING: This will delete all data!)
	@echo "$(RED)WARNING: This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo ""; \
		docker-compose down -v; \
		docker volume prune -f; \
		echo "$(GREEN)Volumes cleaned!$(NC)"; \
	else \
		echo ""; \
		echo "$(YELLOW)Operation cancelled.$(NC)"; \
	fi


## Testing Commands
test: ## Run tests
	@echo "$(GREEN)Running tests...$(NC)"
	@docker-compose exec backend npm test

test-e2e: ## Run end-to-end tests
	@echo "$(GREEN)Running E2E tests...$(NC)"
	@./scripts/health-check.sh e2e

## Maintenance Commands
update: ## Update all services
	@echo "$(GREEN)Updating services...$(NC)"
	@docker-compose pull
	@docker-compose up -d

backup: ## Create full system backup
	@echo "$(GREEN)Creating system backup...$(NC)"
	@mkdir -p backups/$(shell date +%Y%m%d)
	@docker-compose exec postgres pg_dump -U nebu_academy nebu_academy_db > backups/$(shell date +%Y%m%d)/database.sql
	@docker run --rm -v nebu-academy_redis_data:/data -v $(PWD)/backups/$(shell date +%Y%m%d):/backup alpine tar czf /backup/redis.tar.gz -C /data .
	@tar czf backups/$(shell date +%Y%m%d)/uploads.tar.gz backend/uploads/ 2>/dev/null || true
	@echo "$(GREEN)Backup created in backups/$(shell date +%Y%m%d)/$(NC)"

restore: ## Restore from backup (make restore DATE=20240101)
	@echo "$(YELLOW)Restoring from backup $(DATE)...$(NC)"
	@test -d backups/$(DATE) || (echo "$(RED)Backup directory not found!$(NC)" && exit 1)
	@docker-compose exec postgres psql -U nebu_academy -d nebu_academy_db < backups/$(DATE)/database.sql
	@docker run --rm -v nebu-academy_redis_data:/data -v $(PWD)/backups/$(DATE):/backup alpine tar xzf /backup/redis.tar.gz -C /data
	@echo "$(GREEN)Restore completed!$(NC)"

## Utility Commands
shell-backend: ## Access backend container shell
	@docker-compose exec backend bash

shell-mobile: ## Access mobile development environment (use 'cd mobile && npm start')
	@echo "$(BLUE)Starting mobile development server...$(NC)"
	@cd mobile && npm start

shell-livekit: ## Access LiveKit container shell
	@docker-compose exec livekit sh

shell-postgres: ## Access PostgreSQL shell
	@docker-compose exec postgres psql -U nebu_academy -d nebu_academy_db

shell-redis: ## Access Redis shell
	@docker-compose exec redis redis-cli

## Information Commands
ps: ## Show running containers
	@docker-compose ps

top: ## Show container resource usage
	@docker stats $(shell docker-compose ps -q)

networks: ## Show Docker networks
	@docker network ls | grep nebu

volumes: ## Show Docker volumes
	@docker volume ls | grep nebu

images: ## Show Docker images
	@docker images | grep nebu

## Security Commands
security-scan: ## Run security scan on images
	@echo "$(GREEN)Running security scan...$(NC)"
	@docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image nebu-mobile-backend:latest