#!/bin/bash

# ==============================================
# TRAEFIK CONFIG GENERATOR WITH INTERPOLATION
# ==============================================

set -e

GATEWAY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$GATEWAY_DIR")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[INFO]${NC} Generando configuración de Traefik con variables interpoladas..."

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
    echo -e "${GREEN}[SUCCESS]${NC} Variables de entorno cargadas desde .env"
else
    echo -e "${BLUE}[INFO]${NC} No se encontró .env, usando variables del sistema"
fi

# Verify required variables
if [ -z "$ACME_EMAIL" ]; then
    echo -e "${RED}[ERROR]${NC} Variable ACME_EMAIL no está definida"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}[ERROR]${NC} Variable DOMAIN no está definida" 
    exit 1
fi

echo -e "${BLUE}[INFO]${NC} Usando ACME_EMAIL: $ACME_EMAIL"
echo -e "${BLUE}[INFO]${NC} Usando DOMAIN: $DOMAIN"

# Generate config file using envsubst
envsubst < "$GATEWAY_DIR/traefik.prod.template.yml" > "$GATEWAY_DIR/traefik.prod.yml"

echo -e "${GREEN}[SUCCESS]${NC} Configuración generada en traefik.prod.yml"
echo -e "${BLUE}[INFO]${NC} Email interpolado: $(grep -A1 'email:' "$GATEWAY_DIR/traefik.prod.yml" | tail -1 | xargs)"
