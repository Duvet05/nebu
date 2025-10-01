#!/bin/bash

echo "🔍 Ejecutando verificación completa de calidad de código..."
echo ""

cd backend

echo " 1. Verificando linting con ESLint..."
npm run lint:check
LINT_EXIT_CODE=$?

echo ""
echo "🎨 2. Verificando formato con Prettier..."
npm run format:check
PRETTIER_EXIT_CODE=$?

echo ""
echo "🔍 3. Verificando tipos con TypeScript..."
npm run type-check
TYPE_EXIT_CODE=$?

echo ""
echo " RESUMEN:"
echo "==========="

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo " ESLint: Sin errores"
else
    echo " ESLint: Con errores ($LINT_EXIT_CODE)"
fi

if [ $PRETTIER_EXIT_CODE -eq 0 ]; then
    echo " Prettier: Formato correcto"
else
    echo " Prettier: Problemas de formato ($PRETTIER_EXIT_CODE)"
fi

if [ $TYPE_EXIT_CODE -eq 0 ]; then
    echo " TypeScript: Sin errores de tipos"
else
    echo " TypeScript: Errores de tipos ($TYPE_EXIT_CODE)"
fi

echo ""
if [ $LINT_EXIT_CODE -eq 0 ] && [ $PRETTIER_EXIT_CODE -eq 0 ] && [ $TYPE_EXIT_CODE -eq 0 ]; then
    echo " ¡Todo perfecto! El código está listo."
    exit 0
else
    echo "⚠️  Hay problemas que necesitan atención."
    echo ""
    echo "💡 Para arreglar automáticamente:"
    echo "   npm run fix"
    exit 1
fi
