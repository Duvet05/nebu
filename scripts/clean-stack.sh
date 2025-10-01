#!/bin/bash

# ==============================================
# NEBU MOBILE - STACK CLEANUP SCRIPT
# ==============================================

set -e

# Ensure we're using bash
if [ -z "$BASH_VERSION" ]; then
    exec bash "$0" "$@"
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_NAME="nebu-mobile"

echo -e "${BLUE}🧹 Nebu Mobile Stack Cleanup${NC}"
echo "========================================"

# Function to ask for confirmation
confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

echo -e "${YELLOW}⚠️  This script will clean your Docker environment${NC}"
echo -e "${YELLOW}⚠️  Make sure you have backups of important data${NC}"
echo

# Step 1: Stop containers
echo -e "${BLUE}Step 1: Stopping containers...${NC}"
if docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps -q | grep -q .; then
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans
    echo -e "${GREEN} Containers stopped${NC}"
else
    echo -e "${YELLOW}ℹ️  No running containers found${NC}"
fi

# Step 2: Remove project images
echo -e "${BLUE}Step 2: Removing project images...${NC}"
PROJECT_IMAGES=$(docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | grep $PROJECT_NAME | awk '{print $2}' || true)
if [ ! -z "$PROJECT_IMAGES" ]; then
    echo "$PROJECT_IMAGES" | xargs docker rmi -f
    echo -e "${GREEN} Project images removed${NC}"
else
    echo -e "${YELLOW}ℹ️  No project images found${NC}"
fi

# Step 3: Ask about volumes
if confirm "Do you want to remove volumes (THIS WILL DELETE ALL DATA)?"; then
    echo -e "${BLUE}Step 3: Removing volumes...${NC}"
    PROJECT_VOLUMES=$(docker volume ls --format "table {{.Name}}" | grep $PROJECT_NAME || true)
    if [ ! -z "$PROJECT_VOLUMES" ]; then
        echo "$PROJECT_VOLUMES" | xargs docker volume rm -f
        echo -e "${GREEN} Volumes removed${NC}"
    else
        echo -e "${YELLOW}ℹ️  No project volumes found${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  Volumes preserved${NC}"
fi

# Step 4: Clean Docker system
if confirm "Do you want to clean Docker system cache?"; then
    echo -e "${BLUE}Step 4: Cleaning Docker system...${NC}"
    docker system prune -af
    echo -e "${GREEN} Docker system cleaned${NC}"
else
    echo -e "${YELLOW}ℹ️  Docker system cache preserved${NC}"
fi

# Step 5: Clean build cache
if confirm "Do you want to clean Docker build cache?"; then
    echo -e "${BLUE}Step 5: Cleaning build cache...${NC}"
    docker builder prune -af
    echo -e "${GREEN} Build cache cleaned${NC}"
else
    echo -e "${YELLOW}ℹ️  Build cache preserved${NC}"
fi

# Step 6: Rebuild option
if confirm "Do you want to rebuild the stack now?"; then
    echo -e "${BLUE}Step 6: Rebuilding stack...${NC}"
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    echo -e "${GREEN} Stack rebuilt and started${NC}"
else
    echo -e "${YELLOW}ℹ️  Stack not rebuilt. Run 'make prod' when ready${NC}"
fi

echo
echo -e "${GREEN} Cleanup completed!${NC}"
echo
echo -e "${BLUE}Summary:${NC}"
echo "- Containers: Stopped and removed"
echo "- Images: Project images removed"
echo "- Volumes: $([ -z "$PROJECT_VOLUMES" ] && echo "Preserved" || echo "Removed")"
echo "- Cache: $(confirm "cleaned" < /dev/null && echo "Cleaned" || echo "Preserved")"
echo
echo -e "${BLUE}Next steps:${NC}"
echo "- To start fresh: make prod"
echo "- To check status: docker-compose ps"
echo "- To view logs: docker-compose logs -f"
