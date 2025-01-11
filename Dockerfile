# Base
FROM node:23.6-alpine AS base
WORKDIR /app

FROM base AS builder
WORKDIR /app
ENV NODE_ENV=production

# Add metadata about your image
LABEL org.opencontainers.image.source="https://github.com/meceware/wapy.dev"
LABEL org.opencontainers.image.description="Wapy.dev - Track, manage, and optimize your recurring expenses in one powerful dashboard"
LABEL org.opencontainers.image.licenses="MIT + Commons Clause"

# Copy source code
COPY . .

# Build the application
RUN npm ci --force
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

# Disable telemetry
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public/
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/scripts/entrypoint.sh ./
COPY --from=builder /app/LICENSE ./

RUN chmod +x ./entrypoint.sh
RUN npm i -g prisma

USER nextjs

# Expose port
EXPOSE 3000 5555

# Start the application
CMD ["/bin/sh", "./entrypoint.sh"]
