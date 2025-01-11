# Stage 1: Build stage
FROM node:23.5-alpine AS builder

# Set working directory
WORKDIR /app

# Copy only package files to install dependencies
COPY package*.json ./

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install --force

# Build the production version of the app
RUN npm run build && npx prisma generate

# Stage 2: Production stage
FROM node:23.5-alpine

# Set working directory
WORKDIR /app

# Copy production build and Prisma client from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/package*.json ./

# Expose ports
EXPOSE 3000 5555

# Define environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Entrypoint
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["npx prisma migrate deploy && npm start"]