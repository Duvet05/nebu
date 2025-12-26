FROM node:22-alpine AS base

# Install dependencies required for some packages (like bcrypt) and curl for health checks
RUN apk add --no-cache python3 make g++ curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Init stage - Database migrations and seeds
FROM base AS init
CMD ["npm", "run", "init:db"]

# Development stage
FROM base AS development
EXPOSE 3001
ENV NODE_OPTIONS="--experimental-global-webcrypto"
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production

# Create non-root user (Alpine syntax)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Build application
RUN npm run build

# Create uploads directory and set ownership
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Copy files with correct ownership
COPY --chown=nestjs:nodejs . .

# Switch to non-root user
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["npm", "run", "start:prod"]