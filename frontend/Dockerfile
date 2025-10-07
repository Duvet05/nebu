# ==============================================
# NEBU FRONTEND - DOCKERFILE SIMPLIFICADO
# ==============================================

FROM node:18-alpine AS production

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S remix -u 1001

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application (desde build local exitoso)
COPY build ./build
COPY public ./public

# Create uploads directory with proper permissions
RUN mkdir -p public/uploads && chown -R remix:nodejs public/uploads

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Switch to non-root user
USER remix

# Expose port
EXPOSE 3000

# Start application with proper process handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
