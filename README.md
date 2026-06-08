# Store Check Backend

Backend multi-tenant para Store Check, construido con Cloudflare Workers, Hono,
Supabase y TypeScript.

El contexto tecnico para agentes de IA esta en `AI_CONTEXT.md`.

## Requisitos

- Node.js 22 o superior
- Una cuenta de Cloudflare
- Un proyecto de Supabase

## Configuracion local

1. Instala las dependencias:

   ```bash
   pnpm install
   ```

2. Crea `.dev.vars` a partir de `.env.example` y agrega las credenciales de
   Supabase.

3. Inicia el Worker:

   ```bash
   pnpm dev
   ```

4. Comprueba el servicio en `GET /api/v1/health`.

La especificacion OpenAPI esta disponible en `GET /openapi.json` y la
documentacion interactiva en `GET /docs`. El frontend debe generar sus clientes
y tipos desde esta especificacion con Orval. Consulta
`docs/frontend-api-contract.md`.

Todas las propiedades de las respuestas HTTP usan `snake_case`, por ejemplo
`request_id`, `organization_id`, `created_at` y `page_size`. El codigo interno
TypeScript conserva `camelCase`; los helpers compartidos convierten las claves
recursivamente al construir la respuesta.

El flujo de registro por invitacion, sus variables de correo y el bootstrap
inicial de ROOT estan documentados en `docs/invitations.md`.

## Comandos

```bash
pnpm dev
pnpm cf-typegen
pnpm db:start
pnpm db:reset
pnpm db:lint
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm deploy
```

## Estructura

```text
src/
  modules/       Modulos de negocio por feature
  shared/        Infraestructura y contratos compartidos
  app.ts         Composicion HTTP
  index.ts       Entrada del Cloudflare Worker
test/            Pruebas automatizadas
```

Las operaciones criticas de negocio se implementaran como servicios de
aplicacion y funciones transaccionales de PostgreSQL. El service role solo debe
usarse dentro del Worker y nunca exponerse al frontend.

Los tokens de invitacion se generan con entropia criptografica y solo su hash
SHA-256 debe persistirse. Los domain events dependen de un puerto de repositorio
para poder probar los servicios sin una conexion real a Supabase.
