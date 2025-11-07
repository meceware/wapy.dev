# Base
FROM node:25-alpine AS base
WORKDIR /app

FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Provide a dummy DATABASE_URL for Prisma generate (needed on arm64)
ENV DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Copy source code
COPY . .

# Build the application
RUN npm ci --force
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

# Add metadata about your image
LABEL org.opencontainers.image.source="https://github.com/meceware/wapy.dev"
LABEL org.opencontainers.image.description="Wapy.dev - Track, manage, and optimize your recurring expenses in one powerful dashboard"
LABEL org.opencontainers.image.licenses="MIT + Commons Clause"

# Disable telemetry
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy necessary files from builder
COPY --from=builder /app/public ./public/
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts/entrypoint.sh ./
COPY --from=builder /app/LICENSE ./

RUN chmod +x ./entrypoint.sh
# RUN npm i -g prisma

# Expose port
EXPOSE 3000 5555

# Start the application
CMD ["/bin/sh", "./entrypoint.sh"]
