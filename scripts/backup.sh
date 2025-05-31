#!/bin/bash

# Backup Script for Network Monitoring Platform
# This script creates backups of the database and uploaded files

set -e

# Configuration
BACKUP_DIR="./database/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_NAME="network_monitor"
DB_USER="netmon_user"
DB_HOST="localhost"
DB_PORT="5432"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Database backup
print_status "Creating database backup..."
PGPASSWORD="netmon_password" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    --verbose \
    --clean \
    --if-exists \
    --create \
    > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Compress database backup
gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
print_status "Database backup created: db_backup_$TIMESTAMP.sql.gz"

# Files backup
if [ -d "./uploads" ]; then
    print_status "Creating files backup..."
    tar -czf "$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz" ./uploads
    print_status "Files backup created: files_backup_$TIMESTAMP.tar.gz"
fi

# Clean old backups (keep last 7 days)
print_status "Cleaning old backups..."
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete

print_status "Backup completed successfully!"
