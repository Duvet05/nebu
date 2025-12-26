#!/bin/sh
# Entrypoint para la imagen backend
# Permite ejecutar tareas previas (migraciones, seed) antes de arrancar la app.

set -e

# Example: run migrations if a script exists
if [ -f ./scripts/migrate.sh ]; then
  echo "Running database migrations..."
  ./scripts/migrate.sh
fi

# If first argument starts with '-' assume flags for npm
if [ "${1#-}" != "$1" ]; then
  set -- npm "$@"
fi

# If no command provided, default to npm start:prod (handled via CMD)
if [ "$#" -eq 0 ]; then
  exec npm run start:prod
fi

exec "$@"
