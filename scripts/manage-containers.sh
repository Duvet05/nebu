#!/bin/bash

# ==============================================
# NEBU MOBILE - CONTAINER MANAGEMENT SCRIPT
# ==============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Log function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Health check function
check_service_health() {
    local service_name=$1
    local max_attempts=${2:-30}
    local attempt=1
    
    log "Checking health of service: $service_name"
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps "$service_name" | grep -q "healthy\|Up"; then
            success "Service $service_name is healthy"
            return 0
        fi
        
        warning "Attempt $attempt/$max_attempts: Service $service_name not ready yet..."
        sleep 10
        ((attempt++))
    done
    
    error "Service $service_name failed to become healthy after $max_attempts attempts"
    return 1
}

# Start services
start_services() {
    log "Starting Nebu Mobile services..."
    
    cd "$PROJECT_ROOT"
    
    # Create necessary directories
    mkdir -p gateway/letsencrypt
    chmod 600 gateway/letsencrypt/acme.json 2>/dev/null || touch gateway/letsencrypt/acme.json && chmod 600 gateway/letsencrypt/acme.json
    
    # Start infrastructure services first
    log "Starting infrastructure services (Traefik, PostgreSQL, Redis)..."
    docker-compose up -d traefik postgres redis
    
    # Wait for infrastructure to be healthy
    check_service_health "postgres" 30
    check_service_health "redis" 15
    check_service_health "traefik" 20
    
    # Start application services
    log "Starting application services (Backend, Frontend)..."
    docker-compose up -d backend frontend
    
    # Wait for application services
    check_service_health "backend" 60
    check_service_health "frontend" 45
    
    success "All services started successfully!"
    show_status
}

# Stop services
stop_services() {
    log "Stopping Nebu Mobile services..."
    
    cd "$PROJECT_ROOT"
    docker-compose down
    
    success "All services stopped!"
}

# Restart services
restart_services() {
    log "Restarting Nebu Mobile services..."
    stop_services
    sleep 5
    start_services
}

# Show service status
show_status() {
    log "Service Status:"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Docker compose status
    docker-compose ps
    
    echo ""
    log "Service URLs:"
    echo "   Frontend:  https://localhost"
    echo "  API:       https://api.localhost"
    echo "   Traefik:   http://localhost:8080"
    echo "  🔍 Health:    https://health.localhost"
    
    echo ""
    log "Service Health Checks:"
    
    # Check each service
    services=("traefik" "postgres" "redis" "backend" "frontend")
    
    for service in "${services[@]}"; do
        if docker-compose ps "$service" | grep -q "Up.*healthy\|Up.*starting"; then
            echo -e "   $service: ${GREEN}Healthy${NC}"
        elif docker-compose ps "$service" | grep -q "Up"; then
            echo -e "  ⚠️  $service: ${YELLOW}Running (no health check)${NC}"
        else
            echo -e "   $service: ${RED}Not running${NC}"
        fi
    done
}

# View logs
view_logs() {
    local service=${1:-""}
    
    cd "$PROJECT_ROOT"
    
    if [ -z "$service" ]; then
        log "Showing logs for all services..."
        docker-compose logs -f
    else
        log "Showing logs for service: $service"
        docker-compose logs -f "$service"
    fi
}

# Clean up
cleanup() {
    log "Cleaning up Docker resources..."
    
    cd "$PROJECT_ROOT"
    
    # Stop and remove containers
    docker-compose down -v
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful!)
    read -p "Do you want to remove unused volumes? This will delete data! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
        warning "Volumes removed! Data may be lost."
    fi
    
    success "Cleanup completed!"
}

# Run health checks
health_check() {
    log "Running comprehensive health checks..."
    
    cd "$PROJECT_ROOT"
    
    # Check if services are running
    local all_healthy=true
    
    services=("traefik" "postgres" "redis" "backend" "frontend")
    
    for service in "${services[@]}"; do
        if ! check_service_health "$service" 5; then
            all_healthy=false
        fi
    done
    
    # Test endpoints
    log "Testing service endpoints..."
    
    # Test Traefik dashboard
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/dashboard/ | grep -q "200\|302"; then
        echo -e "   Traefik Dashboard: ${GREEN}Accessible${NC}"
    else
        echo -e "   Traefik Dashboard: ${RED}Not accessible${NC}"
        all_healthy=false
    fi
    
    # Test backend health endpoint
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
        echo -e "   Backend Health: ${GREEN}OK${NC}"
    else
        echo -e "   Backend Health: ${RED}Failed${NC}"
        all_healthy=false
    fi
    
    # Test frontend
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo -e "   Frontend: ${GREEN}Accessible${NC}"
    else
        echo -e "   Frontend: ${RED}Not accessible${NC}"
        all_healthy=false
    fi
    
    if [ "$all_healthy" = true ]; then
        success "All health checks passed!"
        return 0
    else
        error "Some health checks failed!"
        return 1
    fi
}

# Show usage
usage() {
    echo "Nebu Mobile Container Management"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs [SVC]  View logs (optionally for specific service)"
    echo "  health      Run health checks"
    echo "  cleanup     Clean up Docker resources"
    echo "  help        Show this help message"
    echo ""
}

# Main script logic
case "${1:-}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        view_logs "$2"
        ;;
    health)
        health_check
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        usage
        ;;
    *)
        usage
        exit 1
        ;;
esac
