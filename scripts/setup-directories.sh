#!/bin/bash

# ==============================================
# SETUP DIRECTORIES AND PERMISSIONS
# ==============================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

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

# Create directories function
create_directory() {
    local dir="$1"
    local permissions="$2"
    local description="$3"
    
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        log_info "Created directory: $dir ($description)"
    else
        log_info "Directory already exists: $dir"
    fi
    
    if [ -n "$permissions" ]; then
        chmod "$permissions" "$dir"
        log_info "Set permissions $permissions on $dir"
    fi
}

# Main setup function
setup_directories() {
    log_info "Setting up directories and permissions for Nebu..."
    
    # Logs directories (Docker will mount these per service)
    create_directory "$PROJECT_ROOT/logs" "755" "Main logs directory"
    create_directory "$PROJECT_ROOT/logs/backend" "755" "Backend NestJS logs"
    create_directory "$PROJECT_ROOT/logs/frontend" "755" "Frontend Next.js logs"
    create_directory "$PROJECT_ROOT/logs/traefik" "755" "Traefik proxy logs"
    
    # Uploads directories (already exist but verify structure)
    create_directory "$PROJECT_ROOT/uploads" "755" "Main uploads directory"
    create_directory "$PROJECT_ROOT/uploads/profiles" "755" "Profile images"
    create_directory "$PROJECT_ROOT/uploads/courses" "755" "Course content"
    create_directory "$PROJECT_ROOT/uploads/documents" "755" "Documents"
    create_directory "$PROJECT_ROOT/uploads/videos" "755" "Video files"
    create_directory "$PROJECT_ROOT/uploads/audio" "755" "Audio files"
    create_directory "$PROJECT_ROOT/uploads/images" "755" "General images"
    create_directory "$PROJECT_ROOT/uploads/temp" "755" "Temporary uploads"
    
    # Database backups (using existing db/ structure)
    create_directory "$PROJECT_ROOT/db/backups" "755" "Database backups"
    create_directory "$PROJECT_ROOT/db/backups/postgres" "755" "PostgreSQL backups"
    create_directory "$PROJECT_ROOT/db/backups/redis" "755" "Redis backups"
    create_directory "$PROJECT_ROOT/db/backups/uploads" "755" "Uploads backups"
    
    # Gateway directories (configuration only, logs moved to main logs/)
    create_directory "$PROJECT_ROOT/gateway/letsencrypt" "755" "SSL certificates"
    
    # Set special permissions for sensitive files
    if [ -f "$PROJECT_ROOT/gateway/letsencrypt/acme.json" ]; then
        chmod 600 "$PROJECT_ROOT/gateway/letsencrypt/acme.json"
        log_info "Set restrictive permissions on acme.json"
    fi
    
    log_success "Directory setup completed!"
}

# Create .gitkeep files
create_gitkeeps() {
    log_info "Creating .gitkeep files for empty directories..."
    
    local directories=(
        "logs/backend"
        "logs/frontend" 
        "logs/traefik"
        "db/backups/postgres"
        "db/backups/redis"
        "db/backups/uploads"
        "uploads/temp"
    )
    
    for dir in "${directories[@]}"; do
        local gitkeep_file="$PROJECT_ROOT/$dir/.gitkeep"
        if [ ! -f "$gitkeep_file" ]; then
            touch "$gitkeep_file"
            log_info "Created .gitkeep in $dir"
        fi
    done
    
    log_success ".gitkeep files created!"
}

# Create gitignore files
create_gitignores() {
    log_info "Creating .gitignore files..."
    
    # Logs gitignore
    cat > "$PROJECT_ROOT/logs/.gitignore" << 'EOF'
# Log files
*.log
*.log.*
*.out
*.err

# Compressed log files
*.gz
*.zip
*.tar

# Keep directory structure
!.gitkeep
!*/
EOF
    
    # Backups gitignore
    cat > "$PROJECT_ROOT/db/backups/.gitignore" << 'EOF'
# Backup files
*.sql
*.dump
*.backup
*.bak
*.rdb
*.aof

# Compressed backups
*.gz
*.zip
*.tar
*.tar.gz

# Keep directory structure
!.gitkeep
!*/
EOF
    
    # Uploads gitignore (update if exists)
    if [ ! -f "$PROJECT_ROOT/uploads/.gitignore" ]; then
        cat > "$PROJECT_ROOT/uploads/.gitignore" << 'EOF'
# Uploaded files
*
!.gitkeep
!*/

# Keep structure directories
!profiles/
!courses/
!documents/
!videos/
!audio/
!images/
!files/
!temp/
EOF
    fi
    
    log_success ".gitignore files created!"
}

# Verify Docker compatibility
verify_docker_setup() {
    log_info "Verifying Docker volume compatibility..."
    
    # Check if Docker can access directories
    local required_dirs=(
        "$PROJECT_ROOT/uploads"
        "$PROJECT_ROOT/logs"
        "$PROJECT_ROOT/logs/backend"
        "$PROJECT_ROOT/logs/frontend"
        "$PROJECT_ROOT/logs/traefik"
        "$PROJECT_ROOT/db/backups"
        "$PROJECT_ROOT/gateway/letsencrypt"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ] && [ -r "$dir" ] && [ -w "$dir" ]; then
            log_success "$dir is accessible"
        else
            log_warning "⚠ $dir may have permission issues"
        fi
    done
}

# Display summary
show_summary() {
    echo ""
    echo "Directory Structure Summary:"
    echo ""
    echo "logs/"
    echo "  ├── backend/     # Backend NestJS logs (isolated volume)"
    echo "  ├── frontend/    # Frontend Next.js logs (isolated volume)"
    echo "  └── traefik/     # Traefik proxy logs (isolated volume)"
    echo ""
    echo "uploads/"
    echo "  ├── profiles/    # User profile images"
    echo "  ├── courses/     # Course content files"
    echo "  ├── documents/   # Document uploads"
    echo "  ├── videos/      # Video files"
    echo "  ├── audio/       # Audio files"
    echo "  ├── images/      # General images"
    echo "  └── temp/        # Temporary uploads"
    echo ""
    echo "db/backups/"
    echo "  ├── postgres/    # PostgreSQL database backups"
    echo "  ├── redis/       # Redis data backups"
    echo "  └── uploads/     # File uploads backups"
    echo ""
    echo "gateway/"
    echo "  └── letsencrypt/ # SSL certificates (logs moved to logs/traefik/)"
    echo ""
    echo "Docker volumes configured:"
    echo "  - ./logs/frontend:/app/logs (frontend service only)"
    echo "  - ./logs/backend:/app/logs (backend service only)"
    echo "  - ./logs/traefik:/logs (traefik service only)"
    echo "  - ./uploads:/app/uploads (frontend)"
    echo "  - uploads-data:/app/uploads (backend)"
    echo "  - ./db/backups:/backups (database)"
    echo "  - ./gateway/letsencrypt:/letsencrypt (traefik)"
    echo ""
}

# Main execution
case "${1:-setup}" in
    "setup")
        setup_directories
        create_gitkeeps
        create_gitignores
        verify_docker_setup
        show_summary
        ;;
    
    "verify")
        verify_docker_setup
        ;;
    
    "clean")
        log_warning "This will remove all log files and temporary uploads. Continue? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            find "$PROJECT_ROOT/logs" -type f -name "*.log*" -delete 2>/dev/null || true
            find "$PROJECT_ROOT/uploads/temp" -type f -delete 2>/dev/null || true
            log_success "Cleaned log files and temporary uploads"
        else
            log_info "Clean operation cancelled"
        fi
        ;;
    
    "help"|*)
        echo "🗂️ Directory Setup Script"
        echo ""
        echo "Usage: $0 <command>"
        echo ""
        echo "Commands:"
        echo "  setup    - Create all directories and set permissions (default)"
        echo "  verify   - Verify Docker volume compatibility"
        echo "  clean    - Clean log files and temporary uploads"
        echo "  help     - Show this help"
        echo ""
        echo "This script prepares the host filesystem for Docker volumes"
        echo "and ensures proper permissions for logs, uploads, and backups."
        ;;
esac
