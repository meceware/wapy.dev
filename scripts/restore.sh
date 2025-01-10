#!/bin/sh

# Function to list available backups
list_backups() {
    echo "Available backups in ./.backup/:"
    ls -1t ./.backup/*.sql 2>/dev/null | head -n 10 | cat -n || echo "No backups found"
}

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

# If no argument provided, list backups and ask for selection
if [ -z "$1" ]; then
    list_backups
    echo "\nEnter the number of the backup to restore (or 'q' to quit):"
    read -r selection

    # Exit if user chooses to quit
    if [ "$selection" = "q" ]; then
        exit 0
    fi

    # Get the selected backup file
    BACKUP_FILE=$(ls -1t ./.backup/*.sql 2>/dev/null | sed -n "${selection}p")

    if [ -z "$BACKUP_FILE" ]; then
        echo "Invalid selection"
        exit 1
    fi
else
    BACKUP_FILE=$1
    if [ ! -f "$BACKUP_FILE" ]; then
        echo "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
fi

echo "Restoring from: $BACKUP_FILE"
echo "Warning: This will overwrite the current database. Are you sure? (y/N)"
read -r confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "Restore cancelled"
    exit 0
fi

if check_docker; then
    echo "Restoring using Docker..."

    # Terminate existing connections and recreate database
    echo "Preparing database for restore..."
    docker exec wapydev-db psql -U ${POSTGRES_USER:-wapydev} postgres -c \
        "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${POSTGRES_DB:-wapydev}' AND pid <> pg_backend_pid();"

    # Drop and recreate the database
    docker exec wapydev-db dropdb -U ${POSTGRES_USER:-wapydev} --if-exists ${POSTGRES_DB:-wapydev}
    docker exec wapydev-db createdb -U ${POSTGRES_USER:-wapydev} ${POSTGRES_DB:-wapydev}

    # Restore the backup
    echo "Restoring database from backup..."
    cat "$BACKUP_FILE" | docker exec -i wapydev-db psql -U ${POSTGRES_USER:-wapydev} ${POSTGRES_DB:-wapydev}
else
    echo "Error: Docker container not found"
    exit 1
fi

echo "Restore completed successfully"