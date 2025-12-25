#!/bin/bash
# Database Backup Script
# Backs up the WordPress database to db-backup folder with timestamp

DB_NAME="fjb_db"
DB_USER="russell_fjb_user"
DB_PASSWORD="EZsDNwLGpIPKi4E"
DB_HOST="db"
DB_CONTAINER="farmer-johns-botanicals-db"
BACKUP_DIR="db-backup"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "Starting database backup..."
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Run mysqldump inside the Docker container
if docker exec $DB_CONTAINER mysqldump -u$DB_USER -p$DB_PASSWORD --single-transaction --quick --lock-tables=false $DB_NAME > "$BACKUP_FILE" 2>&1; then
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup completed successfully!"
    echo "File size: $FILE_SIZE"
    echo "Location: $BACKUP_FILE"
else
    echo "Backup failed!" >&2
    if [ -f "$BACKUP_FILE" ]; then
        rm "$BACKUP_FILE"
    fi
    exit 1
fi

