#!/bin/sh

# Check if rclone is installed
if ! command -v rclone >/dev/null 2>&1; then
  echo "rclone is not installed. Install it first:"
  echo "sudo apt install rclone"
  exit 1
fi

# Check if rclone is configured for Google Drive
if ! rclone listremotes | grep -q "wapy_gdrive:"; then
    echo "Google Drive remote not configured. Run:"
    echo "rclone config"
    echo "and follow the instructions to set up Google Drive."
    exit 1
fi

# Get current timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="wapy_dev_backup_${TIMESTAMP}.tar.gz"

# Create tar.gz archive
mkdir -p .tmp
echo "Creating backup archive..."
tar -czf ".tmp/${BACKUP_FILE}" .backup/

# Create remote backup folder if it doesn't exist
rclone mkdir wapy_gdrive:wapy.dev.backup

# Sync the backup folder to Google Drive
echo "Syncing backup to Google Drive..."
rclone copy ".tmp/${BACKUP_FILE}" wapy_gdrive:wapy.dev.backup --progress
# rclone sync .backup wapy_gdrive:wapy.dev.backup --progress

if [ $? -eq 0 ]; then
    # Clean up
    rm -rf .tmp
    echo "Backup successfully synced to Google Drive"
else
    # Clean up
    rm -rf .tmp
    echo "Error syncing to Google Drive"
    exit 1
fi

# Clean up old backups (keep only 10 most recent)
echo "Cleaning up old backups..."
BACKUP_FILE_COUNT=20
BACKUP_COUNT=$(rclone ls wapy_gdrive:wapy.dev.backup | wc -l)
if [ "$BACKUP_COUNT" -gt $BACKUP_FILE_COUNT ]; then
    # List files sorted by name (which includes timestamp), get the oldest ones
    rclone ls wapy_gdrive:wapy.dev.backup | \
    sort | \
    head -n $(($BACKUP_COUNT - $BACKUP_FILE_COUNT)) | \
    while read -r size name; do
        echo "Removing old backup: $name"
        rclone delete "wapy_gdrive:wapy.dev.backup/$name"
    done
fi

echo "Process complete..."