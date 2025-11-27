#!/bin/sh
# Nebu Backend Startup Script
# Handles database initialization and seeding before starting the application

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

# Function to check if products exist
check_products() {
  node -e "
    const { Client } = require('pg');
    const client = new Client({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432'),
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });
    
    client.connect()
      .then(() => client.query('SELECT COUNT(*) FROM product_catalog'))
      .then(res => {
        const count = parseInt(res.rows[0].count);
        console.log(count);
        return client.end();
      })
      .catch(err => {
        console.log('0');
        return client.end();
      });
  " 2>/dev/null || echo "0"
}

# Function to run product seed
run_product_seed() {
  echo "🌱 Running product seed from CSV..."
  
  SEED_SCRIPT="/app/scripts/seed-products.sh"
  
  if [ -f "$SEED_SCRIPT" ]; then
    chmod +x "$SEED_SCRIPT"
    if sh "$SEED_SCRIPT"; then
      echo "✅ Product seed completed successfully"
      return 0
    else
      echo "⚠️  Product seed failed, but continuing..."
      return 1
    fi
  else
    echo "❌ Seed script not found: ${SEED_SCRIPT}"
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
  
  echo ""
  echo "================================================"
  echo "🚀 Starting Nebu Backend Application"
  echo "================================================"
  echo ""
  
  # Start application in background
  npm run start:prod &
  APP_PID=$!
  
  # Wait for app to be ready
  echo "⏳ Waiting for application to initialize..."
  sleep 15
  
  # Trigger product seed via internal endpoint
  echo ""
  echo "🌱 Triggering product seed..."
  curl -X POST http://localhost:3001/internal/seed-products -s || echo "⚠️  Seed request sent"
  
  echo ""
  echo "✅ Initialization complete!"
  echo ""
  
  # Wait for the application process
  wait $APP_PID
}

# Run main function with all script arguments
main "$@"
