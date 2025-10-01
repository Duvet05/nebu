#!/bin/bash

# Script para configurar directorios de uploads
echo "Configurando sistema de uploads..."

# Crear directorio base
mkdir -p uploads

# Crear subdirectorios por tipo de archivo
mkdir -p uploads/images
mkdir -p uploads/videos  
mkdir -p uploads/audio
mkdir -p uploads/documents
mkdir -p uploads/files

# Configurar permisos (lectura/escritura para el usuario, lectura para el grupo)
chmod -R 755 uploads/

# Crear archivos .gitkeep para mantener las carpetas en git
touch uploads/images/.gitkeep
touch uploads/videos/.gitkeep
touch uploads/audio/.gitkeep
touch uploads/documents/.gitkeep
touch uploads/files/.gitkeep

# Crear .gitignore para evitar subir archivos reales
cat > uploads/.gitignore << EOF
# Ignorar todos los archivos subidos
*
!.gitignore
!*/.gitkeep

# Permitir archivos de ejemplo (opcional)
# !examples/
EOF

echo " Directorios de uploads configurados:"
echo "  📁 uploads/images/ - Imágenes (JPG, PNG, WebP, GIF, SVG)"
echo "  📁 uploads/videos/ - Videos (MP4, WebM, OGG, AVI, MOV)"
echo "  📁 uploads/audio/ - Audio (MP3, WAV, OGG)"
echo "  📁 uploads/documents/ - Documentos (PDF, DOC, PPT, TXT)"
echo "  📁 uploads/files/ - Otros archivos"
echo ""
echo "🔒 Permisos configurados: 755 (rwxr-xr-x)"
echo "📝 .gitignore creado para evitar subir archivos reales"

# Mostrar información de espacio en disco
echo ""
echo "💾 Espacio en disco disponible:"
df -h . | tail -1 | awk '{print "   Disponible: " $4 " de " $2 " (" $5 " usado)"}'

echo ""
echo " Sistema de uploads listo para usar!"
