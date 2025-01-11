#!/bin/sh

# Check migration status
MIGRATION_STATUS=$(npx prisma migrate status)
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    echo "Database schema is up to date, skipping migration..."
else
    echo "Deploying database migrations..."
    npx prisma migrate deploy
fi

echo "Running server..."
node server.js
