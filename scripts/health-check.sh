#!/bin/bash

# ==============================================
# NEBU MOBILE - HEALTH CHECK SCRIPT
# ==============================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="nebu-mobile"
TIMEOUT=10
RETRY_COUNT=3

# Health check endpoints
declare -A HEALTH_ENDPOINTS=(
    ["traefik"]="http://localhost:8080/ping"
    ["backend"]="http://localhost:3001/health"
    ["frontend"]="http://localhost:3000/api/health"
    ["postgres"]="docker exec nebu-mobile-postgres pg_isready -U $DATABASE_USERNAME"
    ["redis"]="docker exec nebu-mobile-redis redis-cli ping"
)

# Service ports
declare -A SERVICE_PORTS=(
    ["traefik"]="8080"
    ["backend"]="3001"
    ["frontend"]="3000"
    ["postgres"]="5432"
    ["redis"]="6379"
)

log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN} $1${NC}"
}

error() {
    echo -e "${RED} $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if container is running
check_container_status() {
    local service=$1
    local container_name="${PROJECT_NAME}-${service}"
    
    if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container_name.*Up"; then
        return 0
    else
        return 1
    fi
}

# Check service health via HTTP
check_http_health() {
    local service=$1
    local endpoint=$2
    local retry=0
    
    while [ $retry -lt $RETRY_COUNT ]; do
        if curl -s -f --max-time $TIMEOUT "$endpoint" >/dev/null 2>&1; then
            return 0
        fi
        ((retry++))
        sleep 2
    done
    return 1
}

# Check service health via command
check_command_health() {
    local command=$1
    local retry=0
    
    while [ $retry -lt $RETRY_COUNT ]; do
        if eval "$command" >/dev/null 2>&1; then
            return 0
        fi
        ((retry++))
        sleep 2
    done
    return 1
}

# Check port connectivity
check_port() {
    local host=${1:-localhost}
    local port=$2
    
    if nc -z -w$TIMEOUT "$host" "$port" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Get container resource usage
get_container_stats() {
    local service=$1
    local container_name="${PROJECT_NAME}-${service}"
    
    if check_container_status "$service"; then
        docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}" "$container_name" | tail -n 1
    else
        echo "N/A\tN/A"
    fi
}

# Individual service health check
check_service() {
    local service=$1
    local overall_status=true
    
    echo ""
    log "Checking service: $service"
    echo "----------------------------------------"
    
    # Check container status
    if check_container_status "$service"; then
        success "Container is running"
    else
        error "Container is not running"
        return 1
    fi
    
    # Check port connectivity
    local port=${SERVICE_PORTS[$service]}
    if [ -n "$port" ]; then
        if check_port "localhost" "$port"; then
            success "Port $port is accessible"
        else
            error "Port $port is not accessible"
            overall_status=false
        fi
    fi
    
    # Check health endpoint
    local endpoint=${HEALTH_ENDPOINTS[$service]}
    if [ -n "$endpoint" ]; then
        if [[ "$endpoint" == docker* ]]; then
            if check_command_health "$endpoint"; then
                success "Service health check passed"
            else
                error "Service health check failed"
                overall_status=false
            fi
        else
            if check_http_health "$service" "$endpoint"; then
                success "HTTP health check passed ($endpoint)"
            else
                error "HTTP health check failed ($endpoint)"
                overall_status=false
            fi
        fi
    fi
    
    # Show resource usage
    local stats=$(get_container_stats "$service")
    echo " Resource usage: $stats"
    
    if [ "$overall_status" = true ]; then
        success "Service $service is healthy"
        return 0
    else
        error "Service $service has issues"
        return 1
    fi
}

# Check all services
check_all_services() {
    local services=("traefik" "postgres" "redis" "backend" "frontend")
    local failed_services=()
    local total_services=${#services[@]}
    local healthy_services=0
    
    echo "🏥 NEBU MOBILE - HEALTH CHECK REPORT"
    echo "========================================"
    
    for service in "${services[@]}"; do
        if check_service "$service"; then
            ((healthy_services++))
        else
            failed_services+=("$service")
        fi
    done
    
    echo ""
    echo "========================================"
    echo " HEALTH CHECK SUMMARY"
    echo "========================================"
    echo " Healthy services: $healthy_services/$total_services"
    
    if [ ${#failed_services[@]} -gt 0 ]; then
        echo " Failed services: ${failed_services[*]}"
        echo ""
        warning "Some services are not healthy!"
        return 1
    else
        echo ""
        success "All services are healthy! "
        return 0
    fi
}

# Check Traefik routes
check_traefik_routes() {
    log "Checking Traefik routes..."
    
    if check_http_health "traefik" "http://localhost:8080/api/http/routers"; then
        success "Traefik API is accessible"
        
        # Get router information
        local routers=$(curl -s http://localhost:8080/api/http/routers 2>/dev/null | jq -r '.[].name' 2>/dev/null || echo "Unable to parse routers")
        echo "📍 Active routes: $routers"
    else
        error "Traefik API is not accessible"
    fi
}

# Test end-to-end connectivity
test_e2e() {
    log "Running end-to-end connectivity tests..."
    
    # Test frontend -> backend
    if curl -s -f --max-time $TIMEOUT "http://localhost:3000/api/health" >/dev/null 2>&1; then
        success "Frontend can reach backend"
    else
        error "Frontend cannot reach backend"
    fi
    
    # Test backend -> database
    if docker exec nebu-mobile-backend npm run db:health >/dev/null 2>&1; then
        success "Backend can reach database"
    else
        warning "Backend database connectivity test failed (command may not exist)"
    fi
    
    # Test backend -> redis
    if docker exec nebu-mobile-backend node -e "const redis = require('redis'); const client = redis.createClient({host: 'redis'}); client.ping();" >/dev/null 2>&1; then
        success "Backend can reach Redis"
    else
        warning "Backend Redis connectivity test failed"
    fi
}

# Show detailed system info
show_system_info() {
    echo ""
    log "System Information"
    echo "=================================="
    echo "🐳 Docker version: $(docker --version)"
    echo "🐙 Docker Compose version: $(docker-compose --version)"
    echo "💾 Available disk space:"
    df -h | grep -E "(Filesystem|/dev/)"
    echo ""
    echo "📦 Container status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep nebu-mobile || echo "No containers running"
}

# Main function
main() {
    case "${1:-all}" in
        "all")
            check_all_services
            ;;
        "traefik"|"postgres"|"redis"|"backend"|"frontend")
            check_service "$1"
            ;;
        "routes")
            check_traefik_routes
            ;;
        "e2e")
            test_e2e
            ;;
        "system")
            show_system_info
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [SERVICE|COMMAND]"
            echo ""
            echo "Services:"
            echo "  all        Check all services (default)"
            echo "  traefik    Check Traefik service"
            echo "  postgres   Check PostgreSQL service"
            echo "  redis      Check Redis service"
            echo "  backend    Check Backend service"
            echo "  frontend   Check Frontend service"
            echo ""
            echo "Commands:"
            echo "  routes     Check Traefik routes"
            echo "  e2e        Run end-to-end tests"
            echo "  system     Show system information"
            echo "  help       Show this help"
            ;;
        *)
            error "Unknown service or command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    error "curl is required but not installed"
    exit 1
fi

if ! command -v nc >/dev/null 2>&1; then
    warning "netcat (nc) is not installed - port checks will be skipped"
fi

# Run main function
main "$@"
