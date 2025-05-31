#!/bin/bash

# Network Monitoring Platform - One-Click Deployment Script
# This script automates the deployment process for the Network Monitoring Platform
# Supports multiple deployment targets: Vercel, Docker, and self-hosted options

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script configuration
SCRIPT_VERSION="1.0.0"
REPO_URL="https://github.com/your-repo/network-monitoring-platform.git"
PROJECT_NAME="network-monitoring-platform"
DEFAULT_PORT=3000

# Logging functions
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
    exit 1
}

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Network Monitoring Platform                   ║"
    echo "║                One-Click Deployment Script                   ║"
    echo "║                     Version $SCRIPT_VERSION                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check if running on supported OS
    if [[ "$OSTYPE" != "linux-gnu"* && "$OSTYPE" != "darwin"* ]]; then
        log_error "This script requires Linux or macOS. Windows users should use WSL."
    fi
    
    # Check for required commands
    local required_commands=("curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "$cmd is required but not installed. Please install it and try again."
        fi
    done
    
    log_success "System requirements check passed"
}

# Detect and install Node.js
setup_nodejs() {
    log_info "Setting up Node.js environment..."
    
    if command -v node &> /dev/null; then
        local node_version=$(node --version | cut -d'v' -f2)
        local major_version=$(echo "$node_version" | cut -d'.' -f1)
        
        if [[ $major_version -ge 18 ]]; then
            log_success "Node.js $node_version is already installed"
            return
        else
            log_warning "Node.js version $node_version is too old. Installing latest LTS..."
        fi
    fi
    
    # Install Node.js using the official installer
    if command -v curl &> /dev/null; then
        log_info "Installing Node.js LTS..."
        curl -fsSL https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz | tar -xJ
        sudo mv node-v20.10.0-linux-x64 /usr/local/node
        echo 'export PATH=/usr/local/node/bin:$PATH' >> ~/.bashrc
        export PATH=/usr/local/node/bin:$PATH
        log_success "Node.js installed successfully"
    else
        log_error "Please install Node.js 18+ manually and run this script again"
    fi
}

# Install package manager
setup_package_manager() {
    log_info "Setting up package manager..."
    
    # Check for preferred package managers
    if command -v pnpm &> /dev/null; then
        PACKAGE_MANAGER="pnpm"
        INSTALL_CMD="pnpm install"
        RUN_CMD="pnpm"
    elif command -v yarn &> /dev/null; then
        PACKAGE_MANAGER="yarn"
        INSTALL_CMD="yarn install"
        RUN_CMD="yarn"
    else
        PACKAGE_MANAGER="npm"
        INSTALL_CMD="npm install"
        RUN_CMD="npm run"
        
        # Install pnpm for better performance
        log_info "Installing pnpm for better performance..."
        npm install -g pnpm
        PACKAGE_MANAGER="pnpm"
        INSTALL_CMD="pnpm install"
        RUN_CMD="pnpm"
    fi
    
    log_success "Using $PACKAGE_MANAGER as package manager"
}

# Clone or update repository
setup_repository() {
    log_info "Setting up project repository..."
    
    if [[ -d "$PROJECT_NAME" ]]; then
        log_warning "Project directory already exists. Updating..."
        cd "$PROJECT_NAME"
        git pull origin main
    else
        log_info "Cloning repository..."
        git clone "$REPO_URL" "$PROJECT_NAME"
        cd "$PROJECT_NAME"
    fi
    
    log_success "Repository setup complete"
}

# Install dependencies
install_dependencies() {
    log_info "Installing project dependencies..."
    
    # Install dependencies with retry logic
    local max_retries=3
    local retry_count=0
    
    while [[ $retry_count -lt $max_retries ]]; do
        if $INSTALL_CMD; then
            log_success "Dependencies installed successfully"
            return
        else
            retry_count=$((retry_count + 1))
            log_warning "Installation failed. Retry $retry_count/$max_retries..."
            sleep 5
        fi
    done
    
    log_error "Failed to install dependencies after $max_retries attempts"
}

# Environment configuration
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [[ ! -f ".env.local" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env.local
            log_info "Created .env.local from .env.example"
        else
            # Create default environment file
            cat > .env.local << EOF
# Network Monitoring Platform Configuration
NEXT_PUBLIC_APP_URL=http://localhost:$DEFAULT_PORT
NEXT_PUBLIC_APP_NAME="Network Monitor"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:$DEFAULT_PORT

# Monitoring Configuration
POLLING_INTERVAL=30000
MAX_DEVICES=1000
ALERT_RETENTION_DAYS=30

# SNMP Configuration
SNMP_COMMUNITY=public
SNMP_VERSION=2c
SNMP_TIMEOUT=5000
EOF
            log_info "Created default .env.local file"
        fi
        
        log_warning "Please review and update .env.local with your specific configuration"
    else
        log_success "Environment file already exists"
    fi
}

# Build the application
build_application() {
    log_info "Building the application..."
    
    if $RUN_CMD build; then
        log_success "Application built successfully"
    else
        log_error "Failed to build the application"
    fi
}

# Deployment options
deploy_vercel() {
    log_info "Deploying to Vercel..."
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        log_info "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy to Vercel
    if vercel --prod; then
        log_success "Successfully deployed to Vercel!"
        log_info "Your application is now live. Check your Vercel dashboard for the URL."
    else
        log_error "Vercel deployment failed"
    fi
}

deploy_docker() {
    log_info "Setting up Docker deployment..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker and try again."
    fi
    
    # Create Dockerfile if it doesn't exist
    if [[ ! -f "Dockerfile" ]]; then
        cat > Dockerfile << 'EOF'
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
EOF
        log_info "Created Dockerfile"
    fi
    
    # Create docker-compose.yml if it doesn't exist
    if [[ ! -f "docker-compose.yml" ]]; then
        cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  redis_data:
EOF
        log_info "Created docker-compose.yml"
    fi
    
    # Build and run with Docker Compose
    if docker-compose up --build -d; then
        log_success "Successfully deployed with Docker!"
        log_info "Application is running at http://localhost:$DEFAULT_PORT"
    else
        log_error "Docker deployment failed"
    fi
}

deploy_selfhosted() {
    log_info "Setting up self-hosted deployment..."
    
    # Install PM2 for process management
    if ! command -v pm2 &> /dev/null; then
        log_info "Installing PM2 process manager..."
        npm install -g pm2
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'network-monitoring-platform',
    script: 'npm',
    args: 'start',
    cwd: './',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=4096'
  }]
};
EOF
    
    # Create logs directory
    mkdir -p logs
    
    # Start the application with PM2
    if pm2 start ecosystem.config.js; then
        pm2 save
        pm2 startup
        log_success "Successfully deployed with PM2!"
        log_info "Application is running at http://localhost:$DEFAULT_PORT"
        log_info "Use 'pm2 monit' to monitor the application"
    else
        log_error "PM2 deployment failed"
    fi
}

# Health check
perform_health_check() {
    log_info "Performing health check..."
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f "http://localhost:$DEFAULT_PORT" &> /dev/null; then
            log_success "Health check passed! Application is running."
            return
        fi
        
        log_info "Waiting for application to start... ($attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_warning "Health check failed. The application might need more time to start."
}

# Cleanup function
cleanup() {
    if [[ $? -ne 0 ]]; then
        log_error "Deployment failed. Check the logs above for details."
        exit 1
    fi
}

# Main deployment flow
main() {
    trap cleanup EXIT
    
    print_banner
    
    # Parse command line arguments
    DEPLOYMENT_TYPE="selfhosted"
    while [[ $# -gt 0 ]]; do
        case $1 in
            --vercel)
                DEPLOYMENT_TYPE="vercel"
                shift
                ;;
            --docker)
                DEPLOYMENT_TYPE="docker"
                shift
                ;;
            --selfhosted)
                DEPLOYMENT_TYPE="selfhosted"
                shift
                ;;
            --port)
                DEFAULT_PORT="$2"
                shift 2
                ;;
            --help)
                cat << EOF
Network Monitoring Platform Deployment Script

Usage: $0 [OPTIONS]

Options:
    --vercel        Deploy to Vercel (default)
    --docker        Deploy using Docker
    --selfhosted    Deploy for self-hosting with PM2
    --port PORT     Set custom port (default: 3000)
    --help          Show this help message

Examples:
    $0 --vercel                 # Deploy to Vercel
    $0 --docker                 # Deploy with Docker
    $0 --selfhosted --port 8080 # Self-host on port 8080
EOF
                exit 0
                ;;
            *)
                log_error "Unknown option: $1. Use --help for usage information."
                ;;
        esac
    done
    
    log_info "Starting deployment with type: $DEPLOYMENT_TYPE"
    
    # Execute deployment steps
    check_requirements
    setup_nodejs
    setup_package_manager
    setup_repository
    install_dependencies
    setup_environment
    
    # Build only for non-Vercel deployments
    if [[ "$DEPLOYMENT_TYPE" != "vercel" ]]; then
        build_application
    fi
    
    # Deploy based on selected type
    case $DEPLOYMENT_TYPE in
        vercel)
            deploy_vercel
            ;;
        docker)
            deploy_docker
            ;;
        selfhosted)
            deploy_selfhosted
            ;;
    esac
    
    # Perform health check for local deployments
    if [[ "$DEPLOYMENT_TYPE" == "docker" || "$DEPLOYMENT_TYPE" == "selfhosted" ]]; then
        perform_health_check
    fi
    
    # Final success message
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Review and update your .env.local configuration"
    echo "2. Access your application at the provided URL"
    echo "3. Complete the initial setup wizard"
    echo "4. Start monitoring your network!"
    echo ""
    echo -e "${BLUE}For support and documentation:${NC}"
    echo "- Documentation: https://docs.your-domain.com"
    echo "- GitHub: $REPO_URL"
    echo "- Issues: $REPO_URL/issues"
}

# Run the main function with all arguments
main "$@"
