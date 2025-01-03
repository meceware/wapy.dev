#!/bin/sh

# Function to safely update env variable if it's empty
update_env_var() {
    local key=$1
    local value=$2
    local env_file=$3

    # If key exists in file but empty
    if grep -q "^${key}=$" "$env_file" || ! grep -q "^${key}=" "$env_file"; then
        echo "Setting $key..."
        sed -i "s|^${key}=.*|${key}=${value}|" "$env_file" 2>/dev/null || \
        echo "${key}=${value}" >> "$env_file"
    else
        echo "Keeping existing $key..."
    fi
}

# Create .env from example if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
fi

# Generate and update secrets only if they're empty
update_env_var "POSTGRES_DB" "wapydev" ".env"
update_env_var "DATABASE_URL" "postgresql://postgres:\${POSTGRES_PASSWORD}@db:5432/wapydev" ".env"
update_env_var "POSTGRES_USER" "wapydev" ".env"
update_env_var "POSTGRES_PASSWORD" "$(openssl rand -base64 32)" ".env"
update_env_var "AUTH_SECRET" "$(openssl rand -base64 32)" ".env"
update_env_var "SUBSCRIPTION_JWT_SECRET" "$(openssl rand -base64 32)" ".env"

# Generate VAPID keys if either key is empty
if ! grep -q "^NEXT_PUBLIC_VAPID_PUBLIC_KEY=.\+" ".env" || ! grep -q "^VAPID_PRIVATE_KEY=.\+" ".env"; then
    echo "Generating VAPID keys..."
    VAPID_KEYS=$(npx --yes web-push generate-vapid-keys --json)
    # echo "VAPID_KEYS: $VAPID_KEYS"
    PUBLIC_KEY=$(echo $VAPID_KEYS | sed -n 's/.*"publicKey":"\([^"]*\)".*/\1/p')
    PRIVATE_KEY=$(echo $VAPID_KEYS | sed -n 's/.*"privateKey":"\([^"]*\)".*/\1/p')

    update_env_var "NEXT_PUBLIC_VAPID_PUBLIC_KEY" "$PUBLIC_KEY" ".env"
    update_env_var "VAPID_PRIVATE_KEY" "$PRIVATE_KEY" ".env"
fi

echo "Environment file setup complete!"