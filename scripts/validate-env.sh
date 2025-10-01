#!/bin/bash

# validate-env.sh
# Environment variables validation script for Nebu
# Usage: ./scripts/validate-env.sh [docker.env|.env|template.env]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script info    echo ""
    echo -e "${BLUE}VALIDATION SUMMARY${NC}"
    echo -e "${BLUE}======================${NC}"RIPT_NAME="Environment Validation"
VERSION="1.0.0"

# Default env file
ENV_FILE="${1:-docker.env}"

print_header() {
    echo -e "${BLUE}${SCRIPT_NAME} v${VERSION}${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo -e "Validating environment file: ${YELLOW}${ENV_FILE}${NC}"
    echo ""
}

print_error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

print_success() {
    echo -e "${GREEN}$1${NC}"
}

print_info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

# Check if env file exists
check_env_file() {
    if [[ ! -f "$ENV_FILE" ]]; then
        print_error "Environment file '$ENV_FILE' not found!"
        echo ""
        echo "Available environment files:"
        ls -la *.env* 2>/dev/null || echo "No .env files found"
        ls -la docker.env* 2>/dev/null || echo "No docker.env files found"
        ls -la frontend/template.env 2>/dev/null || echo "No frontend template.env found"
        exit 1
    fi
    print_success "Environment file found: $ENV_FILE"
}

# Required variables for different services
declare -A REQUIRED_VARS=(
    # Database
    ["POSTGRES_DB"]="Database name"
    ["POSTGRES_USER"]="Database username"
    ["POSTGRES_PASSWORD"]="Database password"
    ["DATABASE_URL"]="Full database connection string"
    
    # Redis
    ["REDIS_HOST"]="Redis server host"
    ["REDIS_PORT"]="Redis server port"
    ["REDIS_PASSWORD"]="Redis authentication password"
    
    # JWT & Security
    ["JWT_SECRET"]="JWT token signing secret"
    ["JWT_EXPIRES_IN"]="JWT token expiration time"
    
    # Backend API
    ["BACKEND_PORT"]="Backend service port"
    ["NODE_ENV"]="Node.js environment (development/production)"
    ["API_VERSION"]="API version"
    
    # Frontend
    ["NEXT_PUBLIC_API_URL"]="Public API endpoint URL"
    ["NEXTAUTH_SECRET"]="NextAuth.js secret key"
    ["NEXTAUTH_URL"]="NextAuth.js canonical URL"
    
    # Email (if using)
    ["SMTP_HOST"]="SMTP server host"
    ["SMTP_PORT"]="SMTP server port"
    ["SMTP_USER"]="SMTP username"
    ["SMTP_PASS"]="SMTP password"
    
    # File uploads
    ["UPLOAD_MAX_SIZE"]="Maximum file upload size"
    ["UPLOAD_ALLOWED_TYPES"]="Allowed file types"
    
    # SSL/Security
    ["SSL_EMAIL"]="Email for SSL certificate"
    ["DOMAIN"]="Primary domain name"
)

# Optional but recommended variables
declare -A OPTIONAL_VARS=(
    ["CORS_ORIGIN"]="CORS allowed origins (deprecated - use FRONTEND_URL)"
    ["FRONTEND_URL"]="Frontend application URL"
    ["RATE_LIMIT_WINDOW"]="Rate limiting window"
    ["RATE_LIMIT_MAX"]="Rate limiting max requests"
    ["LOG_LEVEL"]="Application log level"
    ["BACKUP_SCHEDULE"]="Database backup cron schedule"
    ["REDIS_MAX_MEMORY"]="Redis memory limit"
    ["POSTGRES_MAX_CONNECTIONS"]="PostgreSQL max connections"
)

# Load environment variables
load_env_vars() {
    print_info "Loading environment variables from $ENV_FILE..."
    
    # Create temporary file without comments and empty lines
    TEMP_ENV=$(mktemp)
    grep -v '^#' "$ENV_FILE" | grep -v '^$' > "$TEMP_ENV"
    
    # Source the cleaned env file
    set -a
    source "$TEMP_ENV"
    set +a
    
    rm "$TEMP_ENV"
    print_success "Environment variables loaded"
}

# Validate required variables
validate_required() {
    local missing_vars=()
    local invalid_vars=()
    
    print_info "Validating required variables..."
    echo ""
    
    for var in "${!REQUIRED_VARS[@]}"; do
        local value="${!var}"
        local description="${REQUIRED_VARS[$var]}"
        
        if [[ -z "$value" ]]; then
            missing_vars+=("$var")
            print_error "Missing: $var ($description)"
        else
            # Basic validation rules
            case "$var" in
                "*_PORT")
                    if ! [[ "$value" =~ ^[0-9]+$ ]] || [[ "$value" -lt 1 ]] || [[ "$value" -gt 65535 ]]; then
                        invalid_vars+=("$var")
                        print_error "Invalid port: $var=$value (must be 1-65535)"
                    else
                        print_success "$var = $value"
                    fi
                    ;;
                "*_PASSWORD"|"*_SECRET")
                    if [[ ${#value} -lt 8 ]]; then
                        invalid_vars+=("$var")
                        print_error "Weak password/secret: $var (minimum 8 characters)"
                    else
                        print_success "$var = [HIDDEN] (${#value} characters)"
                    fi
                    ;;
                "*_URL")
                    if [[ ! "$value" =~ ^https?:// ]]; then
                        print_warning "URL format: $var=$value (should start with http:// or https://)"
                    fi
                    print_success "$var = $value"
                    ;;
                "*_EMAIL")
                    if [[ ! "$value" =~ ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$ ]]; then
                        invalid_vars+=("$var")
                        print_error "Invalid email: $var=$value"
                    else
                        print_success "$var = $value"
                    fi
                    ;;
                "NODE_ENV")
                    if [[ ! "$value" =~ ^(development|production|test)$ ]]; then
                        print_warning "NODE_ENV: $value (recommended: development, production, or test)"
                    else
                        print_success "$var = $value"
                    fi
                    ;;
                *)
                    print_success "$var = $value"
                    ;;
            esac
        fi
    done
    
    echo ""
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing ${#missing_vars[@]} required variables"
        return 1
    fi
    
    if [[ ${#invalid_vars[@]} -gt 0 ]]; then
        print_error "Found ${#invalid_vars[@]} invalid variables"
        return 1
    fi
    
    print_success "All required variables are present and valid"
    return 0
}

# Check optional variables
check_optional() {
    local missing_optional=()
    
    print_info "Checking optional variables..."
    echo ""
    
    for var in "${!OPTIONAL_VARS[@]}"; do
        local value="${!var}"
        local description="${OPTIONAL_VARS[$var]}"
        
        if [[ -z "$value" ]]; then
            missing_optional+=("$var")
            print_warning "Optional: $var not set ($description)"
        else
            print_success "$var = $value"
        fi
    done
    
    echo ""
    
    if [[ ${#missing_optional[@]} -gt 0 ]]; then
        print_info "Found ${#missing_optional[@]} optional variables not set (this is OK)"
    else
        print_success "All optional variables are configured"
    fi
}

# Validate service connectivity requirements
validate_connectivity() {
    print_info "Validating service connectivity requirements..."
    echo ""
    
    # Check if ports are not conflicting
    local ports=("$BACKEND_PORT" "$REDIS_PORT" "5432" "80" "443")
    local used_ports=()
    
    for port in "${ports[@]}"; do
        if [[ -n "$port" ]]; then
            if netstat -tuln 2>/dev/null | grep -q ":$port "; then
                used_ports+=("$port")
                print_warning "Port $port is already in use"
            else
                print_success "Port $port is available"
            fi
        fi
    done
    
    # Check if essential directories exist
    local dirs=("./uploads" "./logs" "./db/backups" "./gateway/letsencrypt")
    for dir in "${dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            print_success "Directory exists: $dir"
        else
            print_warning "Directory missing: $dir (run ./scripts/setup-directories.sh)"
        fi
    done
}

# Security recommendations
security_check() {
    print_info "Security recommendations..."
    echo ""
    
    # Check for default/weak values
    local security_issues=()
    
    if [[ "$JWT_SECRET" == "your-super-secret-jwt-key" ]] || [[ ${#JWT_SECRET} -lt 32 ]]; then
        security_issues+=("JWT_SECRET is default or too short")
        print_error "JWT_SECRET should be at least 32 characters and unique"
    fi
    
    if [[ "$POSTGRES_PASSWORD" == "password" ]] || [[ "$POSTGRES_PASSWORD" == "123456" ]]; then
        security_issues+=("POSTGRES_PASSWORD is too common")
        print_error "POSTGRES_PASSWORD should be strong and unique"
    fi
    
    if [[ "$NODE_ENV" == "development" ]]; then
        print_warning "NODE_ENV is set to development (use 'production' for live deployment)"
    fi
    
    if [[ -z "$FRONTEND_URL" ]]; then
        print_warning "FRONTEND_URL not set (required for CORS configuration)"
    fi
    
    if [[ -n "$CORS_ORIGINS" ]]; then
        print_warning "CORS_ORIGINS is deprecated, use FRONTEND_URL instead"
    fi
    
    if [[ ${#security_issues[@]} -eq 0 ]]; then
        print_success "No major security issues found"
    else
        print_error "Found ${#security_issues[@]} security concerns"
    fi
}

# Generate summary report
generate_report() {
    echo ""
    echo -e "${BLUE}� VALIDATION SUMMARY${NC}"
    echo -e "${BLUE}======================${NC}"
    
    local total_required=${#REQUIRED_VARS[@]}
    local total_optional=${#OPTIONAL_VARS[@]}
    
    echo -e "Environment file: ${YELLOW}$ENV_FILE${NC}"
    echo -e "Required variables: ${GREEN}$total_required${NC}"
    echo -e "Optional variables: ${YELLOW}$total_optional${NC}"
    echo ""
    
    if validate_required >/dev/null 2>&1; then
        echo -e "Status: ${GREEN}READY FOR DEPLOYMENT${NC}"
        echo ""
        echo -e "${GREEN}Next steps:${NC}"
        echo -e "1. ${BLUE}docker-compose up -d${NC} - Start all services"
        echo -e "2. ${BLUE}docker-compose logs -f${NC} - Monitor startup"
        echo -e "3. ${BLUE}curl http://localhost:$BACKEND_PORT/api/health${NC} - Test health"
    else
        echo -e "Status: ${RED}NEEDS CONFIGURATION${NC}"
        echo ""
        echo -e "${RED}Required actions:${NC}"
        echo -e "1. Fix missing/invalid variables listed above"
        echo -e "2. Run validation again: ${BLUE}./scripts/validate-env.sh $ENV_FILE${NC}"
        echo -e "3. Consider using template: ${BLUE}cp docker.env.example docker.env${NC}"
    fi
}

# Main execution
main() {
    print_header
    
    check_env_file
    load_env_vars
    
    echo ""
    
    # Run all validations
    local validation_failed=false
    
    if ! validate_required; then
        validation_failed=true
    fi
    
    echo ""
    check_optional
    
    echo ""
    validate_connectivity
    
    echo ""
    security_check
    
    generate_report
    
    echo ""
    
    if [[ "$validation_failed" == "true" ]]; then
        print_error "Environment validation failed!"
        exit 1
    else
        print_success "Environment validation passed!"
        exit 0
    fi
}

# Help function
show_help() {
    echo "Usage: $0 [ENV_FILE]"
    echo ""
    echo "Validates environment variables for Nebu deployment"
    echo ""
    echo "Arguments:"
    echo "  ENV_FILE    Environment file to validate (default: docker.env)"
    echo ""
    echo "Examples:"
    echo "  $0                          # Validate docker.env"
    echo "  $0 .env                     # Validate .env"
    echo "  $0 frontend/template.env    # Validate frontend template"
    echo ""
    echo "Exit codes:"
    echo "  0    All validations passed"
    echo "  1    Validation failed or file not found"
}

# Check for help flag
if [[ "$1" == "-h" ]] || [[ "$1" == "--help" ]]; then
    show_help
    exit 0
fi

# Run main function
main "$@"
