#!/bin/bash

# Network Monitoring Platform Docker Setup Script
# This script sets up the complete development or production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_NAME="network-monitoring-platform"

echo -e "${BLUE}🚀 Setting up Network Monitoring Platform - ${ENVIRONMENT} environment${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads/mibs
mkdir -p database/backups
mkdir -p logs
mkdir -p nginx/ssl

# Set up environment files
if [ "$ENVIRONMENT" = "development" ]; then
    print_status "Setting up development environment..."
    
    # Copy environment files
    if [ ! -f .env ]; then
        cp .env.example .env
        print_warning "Created .env file from .env.example. Please review and update the configuration."
    fi
    
    if [ ! -f backend/.env ]; then
        cp backend/.env.example backend/.env
        print_warning "Created backend/.env file. Please review and update the configuration."
    fi
    
    # Build and start development containers
    print_status "Building and starting development containers..."
    docker-compose -f docker-compose.dev.yml down --remove-orphans
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    docker-compose -f docker-compose.dev.yml ps
    
    print_status "Development environment is ready!"
    echo -e "${BLUE}📱 Frontend: http://localhost:3000${NC}"
    echo -e "${BLUE}🔧 Backend API: http://localhost:8080${NC}"
    echo -e "${BLUE}🗄️  Database: localhost:5432${NC}"
    echo -e "${BLUE}📊 pgAdmin: http://localhost:5050 (admin@example.com / admin)${NC}"
    echo -e "${BLUE}🔴 Redis Insight: http://localhost:8001${NC}"

elif [ "$ENVIRONMENT" = "production" ]; then
    print_status "Setting up production environment..."
    
    # Check for required environment variables
    if [ ! -f .env.production ]; then
        print_error ".env.production file not found. Please create it with production settings."
        exit 1
    fi
    
    # Build and start production containers
    print_status "Building and starting production containers..."
    docker-compose down --remove-orphans
    docker-compose build --no-cache
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 60
    
    # Check service health
    print_status "Checking service health..."
    docker-compose ps
    
    print_status "Production environment is ready!"
    echo -e "${BLUE}🌐 Application: http://localhost${NC}"
    echo -e "${BLUE}🔧 API Health: http://localhost/api/v1/health${NC}"

else
    print_error "Invalid environment. Use 'development' or 'production'."
    exit 1
fi

# Display useful commands
echo -e "\n${YELLOW}📋 Useful Commands:${NC}"
echo -e "${BLUE}View logs:${NC} docker-compose logs -f [service_name]"
echo -e "${BLUE}Stop services:${NC} docker-compose down"
echo -e "${BLUE}Restart services:${NC} docker-compose restart"
echo -e "${BLUE}Update containers:${NC} docker-compose pull && docker-compose up -d"
echo -e "${BLUE}Clean up:${NC} docker-compose down -v --remove-orphans"

print_status "Setup completed successfully! 🎉"
