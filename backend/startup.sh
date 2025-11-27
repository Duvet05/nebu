#!/bin/sh
# Nebu Backend Startup Script
# Handles TypeORM migrations before starting the application

set -e

echo "================================================"
echo "🚀 Nebu Backend Initialization"
echo "================================================"

# Function to wait for PostgreSQL
wait_for_postgres() {
  echo "⏳ Waiting for PostgreSQL to be ready..."

  max_attempts=30
  attempt=0

  while [ $attempt -lt $max_attempts ]; do
    if node -e "
      const { Client } = require('pg');
      const client = new Client({
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionTimeoutMillis: 5000,
      });
      client.connect()
        .then(() => {
          console.log('Connected successfully');
          return client.end();
        })
        .then(() => process.exit(0))
        .catch((err) => {
          console.error('Connection failed:', err.message);
          process.exit(1);
        });
    " 2>/dev/null; then
      echo "✅ PostgreSQL is ready"
      return 0
    fi

    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
    sleep 2
  done

  echo "❌ PostgreSQL did not become ready in time"
  return 1
}

# Function to run TypeORM migrations
run_migrations() {
  echo ""
  echo "🔄 Running TypeORM migrations..."

  if npm run migration:run; then
    echo "✅ Migrations completed successfully"
    return 0
  else
    echo "⚠️  Migration execution failed"
    return 1
  fi
}

# Main initialization flow
main() {
  echo ""
  echo "📋 Environment:"
  echo "   NODE_ENV: ${NODE_ENV:-production}"
  echo "   DATABASE_HOST: ${DATABASE_HOST}"
  echo "   DATABASE_NAME: ${DATABASE_NAME}"
  echo ""

  # Wait for database
  if ! wait_for_postgres; then
    echo "❌ Cannot proceed without database connection"
    exit 1
  fi

  # Run migrations
  if ! run_migrations; then
    echo "⚠️  Migrations failed, but continuing with application startup..."
  fi

  echo ""
  echo "================================================"
  echo "🚀 Starting Nebu Backend Application"
  echo "================================================"
  echo ""

  # Start application
  exec npm run start:prod
}

# Run main function with all script arguments
main "$@"
