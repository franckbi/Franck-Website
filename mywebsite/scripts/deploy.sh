#!/bin/bash

# Production deployment script
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v node >/dev/null 2>&1 || { log_error "Node.js is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed."; exit 1; }
    command -v vercel >/dev/null 2>&1 || { log_error "Vercel CLI is required but not installed."; exit 1; }
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="18.0.0"
    
    if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
        log_error "Node.js version $REQUIRED_VERSION or higher is required. Current: $NODE_VERSION"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Run pre-deployment checks
run_pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci --production=false
    
    # Run linting
    log_info "Running linter..."
    npm run lint
    
    # Run type checking
    log_info "Running type check..."
    npm run type-check
    
    # Run tests
    log_info "Running tests..."
    npm run test:unit -- --run
    
    # Check bundle size
    log_info "Checking bundle size..."
    npm run analyze:bundle
    
    # Performance budget check
    log_info "Checking performance budget..."
    npm run check:performance-budget
    
    log_success "Pre-deployment checks passed"
}

# Build application
build_application() {
    log_info "Building application for $ENVIRONMENT..."
    
    cd "$PROJECT_ROOT"
    
    # Set environment-specific variables
    if [ "$ENVIRONMENT" = "production" ]; then
        export NODE_ENV=production
        cp .env.production .env.local
    elif [ "$ENVIRONMENT" = "staging" ]; then
        export NODE_ENV=production
        cp .env.staging .env.local
    fi
    
    # Optimize assets
    log_info "Optimizing assets..."
    node scripts/optimize-assets.js
    
    # Build Next.js application
    log_info "Building Next.js application..."
    npm run build
    
    # Generate sitemap and robots.txt
    log_info "Generating SEO files..."
    npm run generate:sitemap
    
    log_success "Application built successfully"
}

# Deploy to Vercel
deploy_to_vercel() {
    log_info "Deploying to Vercel ($ENVIRONMENT)..."
    
    cd "$PROJECT_ROOT"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        # Production deployment
        vercel --prod --confirm
    else
        # Preview deployment
        vercel --confirm
    fi
    
    log_success "Deployment completed"
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Get deployment URL
    if [ "$ENVIRONMENT" = "production" ]; then
        DEPLOYMENT_URL="https://your-domain.com"
    else
        DEPLOYMENT_URL=$(vercel ls --scope=your-team | grep "$ENVIRONMENT" | head -1 | awk '{print $2}')
    fi
    
    if [ -z "$DEPLOYMENT_URL" ]; then
        log_error "Could not determine deployment URL"
        exit 1
    fi
    
    log_info "Checking deployment at $DEPLOYMENT_URL"
    
    # Wait for deployment to be ready
    sleep 30
    
    # Basic health check
    if curl -f -s "$DEPLOYMENT_URL/api/health" > /dev/null; then
        log_success "Health check passed"
    else
        log_error "Health check failed"
        exit 1
    fi
    
    # Check critical pages
    CRITICAL_PAGES=("/" "/projects" "/about" "/contact")
    
    for page in "${CRITICAL_PAGES[@]}"; do
        if curl -f -s "$DEPLOYMENT_URL$page" > /dev/null; then
            log_success "Page $page is accessible"
        else
            log_error "Page $page is not accessible"
            exit 1
        fi
    done
    
    # Performance check
    log_info "Running Lighthouse audit..."
    npm run lighthouse:ci -- --url="$DEPLOYMENT_URL"
    
    log_success "All health checks passed"
}

# Run post-deployment tasks
run_post_deployment_tasks() {
    log_info "Running post-deployment tasks..."
    
    # Warm up the application
    log_info "Warming up application..."
    curl -s "$DEPLOYMENT_URL" > /dev/null
    curl -s "$DEPLOYMENT_URL/projects" > /dev/null
    
    # Invalidate CDN cache if applicable
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "Invalidating CDN cache..."
        # Add CDN cache invalidation logic here
    fi
    
    # Send deployment notification
    log_info "Sending deployment notification..."
    # Add notification logic here (Slack, Discord, etc.)
    
    log_success "Post-deployment tasks completed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    # Get previous deployment
    PREVIOUS_DEPLOYMENT=$(vercel ls --scope=your-team | grep "production" | sed -n '2p' | awk '{print $1}')
    
    if [ -n "$PREVIOUS_DEPLOYMENT" ]; then
        vercel promote "$PREVIOUS_DEPLOYMENT" --scope=your-team
        log_success "Rollback completed to $PREVIOUS_DEPLOYMENT"
    else
        log_error "No previous deployment found for rollback"
        exit 1
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    cd "$PROJECT_ROOT"
    
    # Remove temporary files
    rm -f .env.local
    
    # Clean up build artifacts if needed
    # rm -rf .next
    
    log_success "Cleanup completed"
}

# Trap for cleanup on exit
trap cleanup EXIT

# Main deployment flow
main() {
    case "$1" in
        "rollback")
            rollback
            ;;
        *)
            check_prerequisites
            run_pre_deployment_checks
            build_application
            deploy_to_vercel
            run_health_checks
            run_post_deployment_tasks
            ;;
    esac
    
    log_success "🎉 Deployment to $ENVIRONMENT completed successfully!"
}

# Handle script arguments
if [ "$1" = "rollback" ]; then
    main rollback
else
    main "$ENVIRONMENT"
fi