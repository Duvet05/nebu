# ChromaDB API v2 - Referencia Rápida

**Fecha:** 10 de diciembre, 2025  
**Versión ChromaDB:** 1.0.20+  
**Base URL:** `http://localhost:8001/api/v2`

---

## 📚 Recursos Oficiales

- **Documentación oficial:** https://docs.trychroma.com/
- **Cookbook (guías prácticas):** https://cookbook.chromadb.dev/
- **GitHub:** https://github.com/chroma-core/chroma
- **Discord:** https://discord.gg/MMeYNTmh3x

---

## 🔧 Endpoints Principales

### 1. Health Check

```bash
GET /api/v2/heartbeat
```

**Respuesta:**
```json
{"nanosecond heartbeat": 1765379864407707827}
```

---

### 2. Gestión de Colecciones

#### Crear Colección

```bash
POST /api/v2/collections
Content-Type: application/json

{
  "name": "mi_coleccion",
  "metadata": {
    "description": "Descripción opcional",
    "custom_field": "valor"
  }
}
```

#### Listar Colecciones

```bash
GET /api/v2/collections
```

#### Eliminar Colección

```bash
DELETE /api/v2/collections/{collection_name}
```

#### Obtener Info de Colección

```bash
GET /api/v2/collections/{collection_name}
```

---

### 3. Operaciones con Documentos

#### Agregar Documentos (con embeddings automáticos)

```bash
POST /api/v2/collections/{collection_name}/add
Content-Type: application/json

{
  "ids": ["doc1", "doc2", "doc3"],
  "documents": [
    "Texto del primer documento",
    "Texto del segundo documento",
    "Texto del tercer documento"
  ],
  "metadatas": [
    {"categoria": "A", "precio": 10.99},
    {"categoria": "B", "precio": 25.50},
    {"categoria": "A", "precio": 15.00}
  ]
}
```

**Nota:** ChromaDB genera embeddings automáticamente si no los proporcionas.

#### Agregar con Embeddings Personalizados

```bash
POST /api/v2/collections/{collection_name}/add
Content-Type: application/json

{
  "ids": ["doc1"],
  "embeddings": [[0.1, 0.2, 0.3, ...]],  // Vector de números
  "documents": ["Texto opcional"],
  "metadatas": [{"key": "value"}]
}
```

---

### 4. Búsqueda Semántica

#### Query (Búsqueda por texto)

```bash
POST /api/v2/collections/{collection_name}/query
Content-Type: application/json

{
  "query_texts": ["texto a buscar"],
  "n_results": 5,
  "where": {"categoria": "A"},           // Filtro opcional
  "where_document": {"$contains": "palabra"}  // Filtro en documento
}
```

**Respuesta esperada:**
```json
{
  "ids": [["doc1", "doc2"]],
  "documents": [["texto1", "texto2"]],
  "metadatas": [[{"categoria": "A"}, {"categoria": "A"}]],
  "distances": [[0.123, 0.456]]
}
```

#### Query con Embeddings

```bash
POST /api/v2/collections/{collection_name}/query
Content-Type: application/json

{
  "query_embeddings": [[0.1, 0.2, 0.3, ...]],
  "n_results": 3
}
```

---

### 5. Obtener Documentos

#### Get by IDs

```bash
POST /api/v2/collections/{collection_name}/get
Content-Type: application/json

{
  "ids": ["doc1", "doc2"],
  "include": ["documents", "metadatas", "embeddings"]
}
```

#### Get All (con límite)

```bash
POST /api/v2/collections/{collection_name}/get
Content-Type: application/json

{
  "limit": 100,
  "offset": 0
}
```

---

### 6. Actualizar Documentos

```bash
POST /api/v2/collections/{collection_name}/update
Content-Type: application/json

{
  "ids": ["doc1"],
  "documents": ["Nuevo texto actualizado"],
  "metadatas": [{"categoria": "B", "actualizado": true}]
}
```

---

### 7. Eliminar Documentos

```bash
POST /api/v2/collections/{collection_name}/delete
Content-Type: application/json

{
  "ids": ["doc1", "doc2"]
}
```

**O eliminar por filtro:**

```bash
POST /api/v2/collections/{collection_name}/delete
Content-Type: application/json

{
  "where": {"categoria": "obsoleto"}
}
```

---

### 8. Contar Documentos

```bash
GET /api/v2/collections/{collection_name}/count
```

---

## 🔍 Operadores de Filtrado

### Filtros de Metadata (`where`)

```json
{
  "where": {
    "categoria": "A",                     // Igualdad
    "precio": {"$gt": 20},                // Mayor que
    "stock": {"$gte": 10},                // Mayor o igual
    "descuento": {"$lt": 50},             // Menor que
    "puntuacion": {"$lte": 4.5},          // Menor o igual
    "estado": {"$ne": "inactivo"},        // Diferente
    "tags": {"$in": ["nuevo", "oferta"]}, // En lista
    "edad": {"$nin": [1, 2, 3]}           // No en lista
  }
}
```

### Operadores Lógicos

```json
{
  "where": {
    "$and": [
      {"categoria": "A"},
      {"precio": {"$lt": 50}}
    ]
  }
}
```

```json
{
  "where": {
    "$or": [
      {"categoria": "A"},
      {"categoria": "B"}
    ]
  }
}
```

### Filtros en Documentos (`where_document`)

```json
{
  "where_document": {
    "$contains": "palabra clave"
  }
}
```

```json
{
  "where_document": {
    "$not_contains": "excluir"
  }
}
```

---

## 🧠 Embeddings Automáticos

ChromaDB usa por defecto **Sentence Transformers** para generar embeddings automáticamente.

### Modelos por Defecto

- **all-MiniLM-L6-v2** (inglés, rápido, 384 dimensiones)
- Otros modelos configurables

### Usar Embeddings Personalizados (OpenAI, etc.)

Para usar OpenAI embeddings, debes configurarlo en el cliente de ChromaDB:

```python
# Python example
import chromadb
from chromadb.utils import embedding_functions

openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key="tu-api-key",
    model_name="text-embedding-ada-002"
)

collection = client.get_or_create_collection(
    name="mi_coleccion",
    embedding_function=openai_ef
)
```

**Para el backend de NestJS**, usa el cliente de ChromaDB con la configuración de embedding function.

---

## 📊 Ejemplo Completo: Catálogo de Productos

```bash
# 1. Crear colección
curl -X POST http://localhost:8001/api/v2/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "productos",
    "metadata": {"tipo": "catalogo"}
  }'

# 2. Agregar productos
curl -X POST http://localhost:8001/api/v2/collections/productos/add \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["p1", "p2", "p3"],
    "documents": [
      "Laptop HP con Intel i7, 16GB RAM, pantalla 15 pulgadas",
      "Mouse inalámbrico Logitech ergonómico para gaming",
      "Teclado mecánico RGB retroiluminado switches azules"
    ],
    "metadatas": [
      {"categoria": "computadoras", "precio": 899.99, "stock": 5},
      {"categoria": "accesorios", "precio": 49.99, "stock": 20},
      {"categoria": "accesorios", "precio": 129.99, "stock": 15}
    ]
  }'

# 3. Buscar por texto
curl -X POST http://localhost:8001/api/v2/collections/productos/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_texts": ["dispositivo para jugar videojuegos"],
    "n_results": 2,
    "where": {"categoria": "accesorios"}
  }'

# 4. Filtrar por precio
curl -X POST http://localhost:8001/api/v2/collections/productos/query \
  -H "Content-Type: application/json" \
  -d '{
    "query_texts": ["equipo para oficina"],
    "n_results": 3,
    "where": {
      "$and": [
        {"precio": {"$lt": 200}},
        {"stock": {"$gt": 10}}
      ]
    }
  }'

# 5. Contar productos
curl http://localhost:8001/api/v2/collections/productos/count
```

---

## ⚠️ Cambios Importantes de v1 a v2

| Característica | API v1 | API v2 |
|----------------|--------|--------|
| **Base Path** | `/api/v1/*` | `/api/v2/*` |
| **Estado** | Deprecada | Actual |
| **Autenticación** | Basic Auth | Token/Basic Auth |
| **Tenancy** | Limitado | Multi-tenant |
| **Respuestas** | Variadas | Estandarizadas |

**⚠️ Nota:** La API v1 está deprecada y puede ser removida en versiones futuras.

---

## 🔐 Autenticación (Opcional)

Si tu ChromaDB tiene autenticación habilitada:

```bash
# Con Token
curl -X POST http://localhost:8001/api/v2/collections \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Con Basic Auth
curl -X POST http://localhost:8001/api/v2/collections \
  -u username:password \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## 🚀 Integración con NestJS

### Instalación del Cliente

```bash
npm install chromadb
```

### Ejemplo de Servicio

```typescript
import { Injectable } from '@nestjs/common';
import { ChromaClient } from 'chromadb';

@Injectable()
export class ChromaService {
  private client: ChromaClient;
  
  constructor() {
    this.client = new ChromaClient({
      path: 'http://localhost:8001'
    });
  }
  
  async searchProducts(query: string, limit = 5) {
    const collection = await this.client.getCollection({
      name: 'productos'
    });
    
    return await collection.query({
      queryTexts: [query],
      nResults: limit
    });
  }
}
```

---

## 📝 Mejores Prácticas

1. **IDs únicos:** Usa IDs descriptivos y únicos (ej: `prod_123`, no solo `123`)
2. **Metadata rica:** Agrega todos los campos que puedas necesitar filtrar
3. **Batch inserts:** Inserta documentos en lotes de 100-1000 para mejor rendimiento
4. **Índices apropiados:** ChromaDB indexa automáticamente, pero considera la dimensionalidad
5. **Embeddings consistentes:** Si usas embeddings personalizados, usa siempre el mismo modelo
6. **Monitoreo:** Revisa logs y métricas de ChromaDB regularmente

---

## 🐛 Troubleshooting

### No devuelve resultados

- Verifica que los documentos se agregaron: `GET /count`
- Revisa los filtros `where` (pueden ser muy restrictivos)
- Asegúrate de usar `query_texts` en vez de `query_text`

### Errores de embedding

- ChromaDB genera embeddings automáticamente por defecto
- Si usas embeddings personalizados, verifica dimensiones
- Asegúrate de que el modelo de embedding esté disponible

### Lentitud

- Reduce `n_results` en queries
- Usa filtros `where` para reducir el espacio de búsqueda
- Considera agregar más recursos al contenedor

---

## 📚 Recursos Adicionales

- **Cookbook oficial:** https://cookbook.chromadb.dev/
- **Filters guide:** https://cookbook.chromadb.dev/core/filters/
- **Performance tips:** https://cookbook.chromadb.dev/running/performance-tips/
- **Multi-tenancy:** https://cookbook.chromadb.dev/strategies/multi-tenancy/

---

**Última actualización:** Diciembre 2025  
**Autor:** DevOps Team Nebu
