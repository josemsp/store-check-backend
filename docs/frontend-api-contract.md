# Frontend API Contract

El backend es la fuente de verdad del contrato HTTP. El frontend no debe
mantener manualmente DTOs, tipos de respuestas ni clientes duplicados.

## Endpoints

```text
OpenAPI JSON: /openapi.json
Swagger UI:   /docs
API V1:       /api/v1
```

Cada operacion debe declarar un `operationId` unico y estable. Orval usa este
valor para generar nombres predecibles de funciones y hooks.

## Orval

Ejemplo de configuracion para el repositorio frontend:

```ts
import { defineConfig } from 'orval'

export default defineConfig({
  storeCheck: {
    input: {
      target: 'http://localhost:8787/openapi.json',
    },
    output: {
      target: 'src/api/generated/store-check.ts',
      schemas: 'src/api/generated/models',
      client: 'react-query',
      httpClient: 'fetch',
      mode: 'tags-split',
      clean: true,
    },
  },
})
```

Los archivos generados no se editan manualmente. Cuando cambie un endpoint:

1. Actualizar sus schemas y declaracion OpenAPI en el backend.
2. Verificar `pnpm check`.
3. Regenerar el cliente del frontend con Orval.
4. Revisar el diff generado como parte del cambio de contrato.

## Convenciones

- Todas las rutas de negocio viven bajo `/api/v1`.
- Los schemas reutilizables tienen nombre OpenAPI.
- Las respuestas usan `{ success, data, meta }`.
- Los errores usan `{ success, error, meta }`.
- Todas las propiedades de las respuestas HTTP usan `snake_case`, incluyendo
  objetos anidados, errores y metadata.
- Ejemplos: `request_id`, `organization_id`, `created_at`, `page_size`.
- El dominio y la implementacion TypeScript pueden conservar `camelCase`; los
  helpers de respuesta convierten las claves recursivamente en el limite HTTP.
- Las rutas privadas declaran `BearerAuth`.
- Los cambios incompatibles requieren una nueva version de API.
