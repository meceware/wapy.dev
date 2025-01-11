#!/bin/sh

# Get timestamp for backup file name
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./.backup"
BACKUP_FILE="wapy_backup_${TIMESTAMP}.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to check if docker is running and postgres container exists
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        return 1
    fi
    if ! docker ps -q -f name=wapydev-db >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

# Check if pg_dump is available locally
if check_docker; then
    echo "Creating backup using Docker..."
    docker exec wapydev-db pg_dump -U ${POSTGRES_USER:-wapydev} \
        --clean --if-exists --no-acl \
        ${POSTGRES_DB:-wapydev} > "${BACKUP_DIR}/${BACKUP_FILE}"
else
    echo "Error: Docker container not found"
    exit 1
fi

# Check if backup was successful
if [ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]; then
    echo "Backup created successfully: ${BACKUP_DIR}/${BACKUP_FILE}"

    # Check number of backup files and remove oldest if > 50
    BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/*.sql 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 50 ]; then
        OLDEST_BACKUP=$(ls -1t "${BACKUP_DIR}"/*.sql | tail -1)
        rm "$OLDEST_BACKUP"
        echo "Removed oldest backup: $OLDEST_BACKUP"
    fi
else
    echo "Error: Backup failed"
    exit 1
fi