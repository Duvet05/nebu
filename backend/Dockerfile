FROM node:22-alpine AS base

# Install curl para el startup script
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code  
COPY . .

# Development stage
FROM base AS development
EXPOSE 3001
ENV NODE_OPTIONS="--experimental-global-webcrypto"
CMD ["npm", "run", "start:dev"]

# Production stage
FROM base AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Build application
RUN npm run build

# Create uploads directory and set ownership
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Copy files with correct ownership
COPY --chown=nestjs:nodejs . .

# Copy startup script
COPY startup.sh /usr/local/bin/startup.sh
RUN chmod +x /usr/local/bin/startup.sh

# Switch to non-root user
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://localhost:3001/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Use startup script — it will exec the provided CMD. Keep default to start production.
ENTRYPOINT ["/usr/local/bin/startup.sh"]
CMD ["npm", "run", "start:prod"]