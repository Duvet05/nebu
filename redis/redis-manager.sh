#!/bin/bash

# ==============================================
# REDIS MANAGEMENT SCRIPT
# ==============================================

set -e

REDIS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$REDIS_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
elif [ -f "$PROJECT_ROOT/docker.env" ]; then
    source "$PROJECT_ROOT/docker.env"
fi

REDIS_PASSWORD=${REDIS_PASSWORD:-""}
CONTAINER_NAME="nebu-redis"

# Helper function to execute Redis commands
redis_cmd() {
    if [ -n "$REDIS_PASSWORD" ]; then
        docker exec $CONTAINER_NAME redis-cli -a "$REDIS_PASSWORD" "$@"
    else
        docker exec $CONTAINER_NAME redis-cli "$@"
    fi
}

# Functions
check_redis() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        log_error "Redis container no está ejecutándose"
        return 1
    fi
    return 0
}

show_info() {
    log_info "Información de Redis..."
    
    if ! check_redis; then
        return 1
    fi
    
    echo ""
    echo " Estado del servidor:"
    redis_cmd INFO server | grep -E "(redis_version|uptime_in_seconds|process_id)"
    
    echo ""
    echo "💾 Uso de memoria:"
    redis_cmd INFO memory | grep -E "(used_memory_human|used_memory_peak_human|maxmemory_human)"
    
    echo ""
    echo "📈 Estadísticas:"
    redis_cmd INFO stats | grep -E "(total_commands_processed|instantaneous_ops_per_sec|total_connections_received)"
    
    echo ""
    echo "Configuración clave:"
    redis_cmd CONFIG GET maxmemory
    redis_cmd CONFIG GET maxmemory-policy
    redis_cmd CONFIG GET databases
}

show_stats() {
    log_info "Estadísticas en tiempo real de Redis..."
    
    if ! check_redis; then
        return 1
    fi
    
    redis_cmd --stat
}

show_keys() {
    log_info "Claves en Redis..."
    
    if ! check_redis; then
        return 1
    fi
    
    local pattern="${1:-*}"
    local count=$(redis_cmd DBSIZE)
    
    echo "Total de claves: $count"
    echo ""
    
    if [ "$count" -gt 0 ]; then
        echo "Primeras 20 claves (patrón: $pattern):"
        redis_cmd --scan --pattern "$pattern" | head -20
        
        if [ "$count" -gt 20 ]; then
            echo "... y $((count - 20)) más"
        fi
    fi
}

monitor_redis() {
    log_info "Monitoreando comandos de Redis (Ctrl+C para salir)..."
    
    if ! check_redis; then
        return 1
    fi
    
    redis_cmd MONITOR
}

flush_cache() {
    local db="${1:-0}"
    
    log_warning "¿Estás seguro de que quieres limpiar la base de datos $db? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        redis_cmd SELECT "$db"
        redis_cmd FLUSHDB
        log_success "Base de datos $db limpiada"
    else
        log_info "Operación cancelada"
    fi
}

test_connection() {
    log_info "Probando conexión a Redis..."
    
    if ! check_redis; then
        return 1
    fi
    
    local response=$(redis_cmd PING)
    if [ "$response" = "PONG" ]; then
        log_success "Conexión exitosa - Redis responde: $response"
    else
        log_error "Conexión fallida - Respuesta: $response"
        return 1
    fi
}

benchmark() {
    log_info "Ejecutando benchmark de Redis..."
    
    if ! check_redis; then
        return 1
    fi
    
    local tests="${1:-SET,GET}"
    local requests="${2:-10000}"
    local clients="${3:-50}"
    
    docker exec $CONTAINER_NAME redis-benchmark -a "$REDIS_PASSWORD" -t "$tests" -n "$requests" -c "$clients"
}

show_config() {
    log_info "Configuración actual de Redis..."
    
    if ! check_redis; then
        return 1
    fi
    
    echo "Configuración de memoria:"
    redis_cmd CONFIG GET maxmemory*
    
    echo ""
    echo "💾 Configuración de persistencia:"
    redis_cmd CONFIG GET save
    redis_cmd CONFIG GET appendonly
    
    echo ""
    echo "🔒 Configuración de seguridad:"
    redis_cmd CONFIG GET requirepass | sed 's/your_password_here/***HIDDEN***/'
    
    echo ""
    echo " Configuración de red:"
    redis_cmd CONFIG GET bind
    redis_cmd CONFIG GET port
    redis_cmd CONFIG GET timeout
}

# Main script
case "${1:-help}" in
    "info")
        show_info
        ;;
    
    "stats")
        show_stats
        ;;
    
    "keys")
        show_keys "${2:-*}"
        ;;
    
    "monitor")
        monitor_redis
        ;;
    
    "test")
        test_connection
        ;;
    
    "config")
        show_config
        ;;
    
    "benchmark")
        benchmark "${2:-SET,GET}" "${3:-10000}" "${4:-50}"
        ;;
    
    "flush")
        flush_cache "${2:-0}"
        ;;
    
    "help"|*)
        echo "🔴 Redis Management Script"
        echo ""
        echo "Uso: $0 <comando> [argumentos]"
        echo ""
        echo "Comandos disponibles:"
        echo "  info           - Muestra información general de Redis"
        echo "  stats          - Muestra estadísticas en tiempo real"
        echo "  keys [patrón]  - Lista claves (patrón opcional, default: *)"
        echo "  monitor        - Monitorea comandos en tiempo real"
        echo "  test           - Prueba la conexión a Redis"
        echo "  config         - Muestra la configuración actual"
        echo "  benchmark      - Ejecuta benchmark [tests] [requests] [clients]"
        echo "  flush [db]     - Limpia base de datos (default: 0)"
        echo "  help           - Muestra esta ayuda"
        echo ""
        echo "Ejemplos:"
        echo "  $0 info"
        echo "  $0 keys 'nebu:*'"
        echo "  $0 benchmark SET,GET 5000 25"
        echo "  $0 flush 0"
        ;;
esac
