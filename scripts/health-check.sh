#!/bin/bash

# Health Check Script for Network Monitoring Platform
# This script checks the health of all services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://localhost:3000"
BACKEND_URL="http://localhost:8080"
POSTGRES_HOST="localhost"
POSTGRES_PORT="5432"
REDIS_HOST="localhost"
REDIS_PORT="6379"

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if service is running
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    print_info "Checking $service_name..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        print_status "$service_name is healthy"
        return 0
    else
        print_error "$service_name is not responding"
        return 1
    fi
}

# Check database connection
check_database() {
    print_info "Checking PostgreSQL database..."
    
    if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U netmon_user > /dev/null 2>&1; then
        print_status "PostgreSQL database is healthy"
        return 0
    else
        print_error "PostgreSQL database is not responding"
        return 1
    fi
}

# Check Redis connection
check_redis() {
    print_info "Checking Redis cache..."
    
    if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null 2>&1; then
        print_status "Redis cache is healthy"
        return 0
    else
        print_error "Redis cache is not responding"
        return 1
    fi
}

# Check Docker containers
check_containers() {
    print_info "Checking Docker containers..."
    
    local containers=$(docker-compose ps -q)
    local healthy_count=0
    local total_count=0
    
    for container in $containers; do
        total_count=$((total_count + 1))
        local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
        local name=$(docker inspect --format='{{.Name}}' "$container" | sed 's/\///')
        
        if [ "$status" = "healthy" ] || [ "$status" = "no-health-check" ]; then
            local running=$(docker inspect --format='{{.State.Running}}' "$container")
            if [ "$running" = "true" ]; then
                print_status "Container $name is running"
                healthy_count=$((healthy_count + 1))
            else
                print_error "Container $name is not running"
            fi
        else
            print_error "Container $name is unhealthy (status: $status)"
        fi
    done
    
    echo -e "${BLUE}Container Summary: $healthy_count/$total_count healthy${NC}"
}

# Check disk space
check_disk_space() {
    print_info "Checking disk space..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        print_status "Disk space is sufficient ($usage% used)"
    elif [ "$usage" -lt 90 ]; then
        print_warning "Disk space is getting low ($usage% used)"
    else
        print_error "Disk space is critically low ($usage% used)"
    fi
}

# Check memory usage
check_memory() {
    print_info "Checking memory usage..."
    
    local memory_info=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    local memory_usage=${memory_info%.*}
    
    if [ "$memory_usage" -lt 80 ]; then
        print_status "Memory usage is normal (${memory_usage}% used)"
    elif [ "$memory_usage" -lt 90 ]; then
        print_warning "Memory usage is high (${memory_usage}% used)"
    else
        print_error "Memory usage is critically high (${memory_usage}% used)"
    fi
}

# Main health check
main() {
    echo -e "${BLUE}🏥 Network Monitoring Platform Health Check${NC}"
    echo -e "${BLUE}===========================================${NC}\n"
    
    local failed_checks=0
    
    # Check services
    check_service "Frontend" "$FRONTEND_URL" || failed_checks=$((failed_checks + 1))
    check_service "Backend API" "$BACKEND_URL/health" || failed_checks=$((failed_checks + 1))
    
    # Check infrastructure
    check_database || failed_checks=$((failed_checks + 1))
    check_redis || failed_checks=$((failed_checks + 1))
    
    # Check containers
    check_containers
    
    # Check system resources
    check_disk_space
    check_memory
    
    echo -e "\n${BLUE}===========================================${NC}"
    
    if [ $failed_checks -eq 0 ]; then
        print_status "All health checks passed! 🎉"
        exit 0
    else
        print_error "$failed_checks health check(s) failed!"
        exit 1
    fi
}

# Run health check
main "$@"
