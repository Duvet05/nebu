#!/bin/bash

# ==============================================
# TRAEFIK MANAGEMENT SCRIPT
# ==============================================

set -e

GATEWAY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$GATEWAY_DIR")"

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

# Check if running from correct directory
if [ ! -f "$GATEWAY_DIR/traefik.yml" ]; then
    log_error "Este script debe ejecutarse desde el directorio gateway/"
    exit 1
fi

# Functions
check_permissions() {
    log_info "Verificando permisos de acme.json..."
    
    if [ ! -f "$GATEWAY_DIR/letsencrypt/acme.json" ]; then
        log_warning "acme.json no existe, creándolo..."
        mkdir -p "$GATEWAY_DIR/letsencrypt"
        echo '{}' > "$GATEWAY_DIR/letsencrypt/acme.json"
    fi
    
    chmod 600 "$GATEWAY_DIR/letsencrypt/acme.json"
    log_success "Permisos de acme.json configurados correctamente (600)"
}

validate_config() {
    log_info "Validando configuración de Traefik..."
    
    # Check required files
    required_files=("traefik.yml" "dynamic.yml")
    for file in "${required_files[@]}"; do
        if [ ! -f "$GATEWAY_DIR/$file" ]; then
            log_error "Archivo requerido no encontrado: $file"
            return 1
        fi
    done
    
    # Check directories
    mkdir -p "$GATEWAY_DIR/logs"
    mkdir -p "$GATEWAY_DIR/letsencrypt"
    
    log_success "Configuración validada correctamente"
}

show_logs() {
    log_info "Mostrando logs de Traefik..."
    
    if [ "$1" = "access" ]; then
        if [ -f "$GATEWAY_DIR/logs/access.log" ]; then
            tail -f "$GATEWAY_DIR/logs/access.log" | jq '.'
        else
            log_warning "Log de acceso no encontrado"
        fi
    else
        if [ -f "$GATEWAY_DIR/logs/traefik.log" ]; then
            tail -f "$GATEWAY_DIR/logs/traefik.log"
        else
            log_warning "Log de Traefik no encontrado"
        fi
    fi
}

show_status() {
    log_info "Estado de Traefik..."
    
    if docker ps | grep -q "nebu-traefik"; then
        log_success "Traefik está ejecutándose"
        docker ps --filter "name=nebu-traefik" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        log_warning "Traefik no está ejecutándose"
    fi
}

show_certificates() {
    log_info "Estado de certificados SSL..."
    
    if [ -f "$GATEWAY_DIR/letsencrypt/acme.json" ]; then
        cert_count=$(jq -r '.letsencrypt.Certificates // [] | length' "$GATEWAY_DIR/letsencrypt/acme.json" 2>/dev/null || echo "0")
        log_info "Certificados almacenados: $cert_count"
        
        if [ "$cert_count" -gt 0 ]; then
            jq -r '.letsencrypt.Certificates // [] | .[] | .domain.main' "$GATEWAY_DIR/letsencrypt/acme.json" 2>/dev/null | while read domain; do
                if [ -n "$domain" ]; then
                    log_success "✓ $domain"
                fi
            done
        fi
    else
        log_warning "Archivo acme.json no encontrado"
    fi
}

# Main script
case "${1:-help}" in
    "setup")
        log_info "Configurando Traefik..."
        validate_config
        check_permissions
        log_success "Traefik configurado correctamente"
        ;;
    
    "status")
        show_status
        ;;
    
    "logs")
        show_logs "${2:-system}"
        ;;
    
    "certs")
        show_certificates
        ;;
    
    "restart")
        log_info "Reiniciando Traefik..."
        cd "$PROJECT_ROOT"
        docker-compose restart traefik
        log_success "Traefik reiniciado"
        ;;
    
    "help"|*)
        echo "🚦 Traefik Management Script"
        echo ""
        echo "Uso: $0 <comando>"
        echo ""
        echo "Comandos disponibles:"
        echo "  setup     - Configura directorios y permisos"
        echo "  status    - Muestra el estado del contenedor"
        echo "  logs      - Muestra logs del sistema (usar 'logs access' para logs de acceso)"
        echo "  certs     - Muestra estado de certificados SSL"
        echo "  restart   - Reinicia el contenedor de Traefik"
        echo "  help      - Muestra esta ayuda"
        echo ""
        echo "Ejemplos:"
        echo "  $0 setup"
        echo "  $0 logs access"
        echo "  $0 certs"
        ;;
esac
